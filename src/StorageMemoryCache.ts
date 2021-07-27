import {
  cleanUpQuery,
  Document,
  documentIsExpired,
  isErr,
  IStorageAsync,
  IValidator,
  Query,
  QueryForForget,
  queryMatchesDoc,
  QueryNoLimitBytes,
  sorted,
  StorageBase,
  uniq,
  ValidationError,
  WorkspaceAddress,
  WriteResult,
} from "earthstar";

// Example flows:

// 1. ingestDocument is called
// 2. Checks if ingested document belongs in any cached queries
// 3. If so, insert / replace the document in the cached query
// 3. Result is ingested to backing storage

// (CACHE MISS)
// 1. documents is called and query is not in cache (Cache miss)
// 2. undefined is returned
// 3. same query to backing storage is made
// 4. result from backing storage is added to cache

// (CACHE HIT - FRESH)
// 1. documents is called and there is a fresh result in the cache
// 2. the fresh result is returned

// (CACHE HIT - STALE)
// 1. documents is called and there is a stale result in the cache
// 2. the stale result is returned
// 3. same query is made to backing storage
// 4. result from backing storage is ingested into cache storage

export default class StorageMemoryCache extends StorageBase {
  _queryCache: Map<Query, { docs: Document[]; expires: number }> = new Map();
  _emptyQuery: Query = {};
  _getDocumentQueries: Map<string, Query> = new Map();
  _queryNoLimitCache: Map<QueryNoLimitBytes, Query> = new Map();
  _config: Record<string, string> = {};
  _backingStorage: IStorageAsync;
  _timeToLive: number;

  constructor(
    validators: IValidator[],
    workspace: WorkspaceAddress,
    createBackingStorage: (
      validators: IValidator[],
      workspace: WorkspaceAddress,
    ) => IStorageAsync,
    timeToLive?: number,
  ) {
    super(validators, workspace);

    this._backingStorage = createBackingStorage(validators, workspace);
    this._timeToLive = timeToLive || 1000 * 10000;

    this._queryNoLimitCache.set(this._emptyQuery, {
      limit: undefined,
      limitBytes: undefined,
    });

    this._queryCache.set(this._emptyQuery, {
      docs: [],
      expires: Date.now() * 1000,
    });

    this._backingStorage.onWrite.subscribe((event) => {
      this.onWrite.send({
        ...event,
        fromSessionId: this._backingStorage.sessionId,
      });
    });
  }

  setConfig(key: string, content: string): void {
    this._config[key] = content;
  }

  getConfig(key: string): string | undefined {
    return this._config[key];
  }

  deleteConfig(key: string): void {
    delete this._config[key];
  }

  deleteAllConfig(): void {
    this._config = {};
  }

  documents(query: Query) {
    this._assertNotClosed();

    let now = this._now || Date.now() * 1000;

    if (query?.limit === 0 || query?.limitBytes === 0) {
      return [];
    }

    const isEmpty = query === undefined ||
      (query &&
        Object.keys(query).length === 0 &&
        query.constructor === Object);

    const cacheResult = this._queryCache.get(
      isEmpty ? this._emptyQuery : query,
    );

    console.log(query, cacheResult);

    const isCacheHit = cacheResult && cacheResult.expires >= now;

    if (!isCacheHit || (cacheResult && cacheResult.expires < now)) {
      this._backingStorage.documents(query).then((result) => {
        this._queryCache.set(query, {
          docs: result,
          expires: now + this._timeToLive,
        });
      });
    }

    if (!cacheResult) {
      return [];
    }

    return cacheResult.docs;
  }

  // My strategy is to see if the upserted document belongs in any currently cached queries, and insert / replace them there.
  ingestDocument(doc: Document, fromSessionId: string) {
    this._assertNotClosed();

    this._upsertDocument(doc);

    this._backingStorage.ingestDocument(doc, fromSessionId).then((result) => {
      if (isErr(result)) {
        console.log("argh");
        return;
      }

      this._backingStorage.getDocument(doc.path).then(() => {
        this._upsertDocument(doc);
      });
    });

    return WriteResult.Accepted;
  }

  paths(query?: QueryNoLimitBytes): string[] {
    this._assertNotClosed();

    // if limit is zero, this will always return []
    if (query?.limit === 0) {
      return [];
    }

    // to make sure we're counting unique paths, not documents, we have to:
    // remove limit

    if (query && !this._queryNoLimitCache.has(query)) {
      this._queryNoLimitCache.set(query, {
        ...query,
        limit: undefined,
        limitBytes: undefined,
      });
    }

    const stableQuery = (query && this._queryNoLimitCache.get(query)) ||
      this._emptyQuery;

    // do query and get unique paths
    let docs = this.documents(stableQuery);
    let paths = sorted(uniq(docs.map((doc) => doc.path)));
    // re-apply limit
    if (query?.limit !== undefined) {
      paths = paths.slice(0, query.limit);
    }
    return paths;
  }

  getDocument(path: string): Document | undefined {
    this._assertNotClosed();

    if (!this._getDocumentQueries.has(path)) {
      this._getDocumentQueries.set(path, {
        path,
        limit: 1,
        history: "latest",
      });
    }

    const stableQuery = this._getDocumentQueries.get(path) || this._emptyQuery;

    return this.documents(stableQuery)[0];
  }

  _upsertDocument(docToUpsert: Document): void {
    this._assertNotClosed();
    Object.freeze(docToUpsert);

    let now = this._now || Date.now() * 1000;

    const docQuery = this._getDocumentQueries.get(docToUpsert.path);

    if (!docQuery) {
      let newDocQuery: Query = {
        path: docToUpsert.path,
        limit: 1,
        history: "latest",
      };
      this._getDocumentQueries.set(docToUpsert.path, newDocQuery);

      this._queryCache.set(newDocQuery, {
        docs: [docToUpsert],
        expires: now + this._timeToLive,
      });
    } else {
      this._queryCache.set(docQuery, {
        docs: [docToUpsert],
        expires: now + this._timeToLive,
      });
    }

    for (let entry of this._queryCache) {
      const query = entry[0];
      const { docs, expires } = entry[1];

      let foundIndex = docs.findIndex(
        (doc) =>
          doc.path === docToUpsert.path && doc.author === docToUpsert.author,
      );

      // TODO: does not take history, limit, limitBytes into account...
      //let dontRiskIt = key.limit || key.limitBytes || key.history;
      let matchesQuery = query === this._emptyQuery || query === undefined
        ? true
        : queryMatchesDoc(query, docToUpsert);

      let next = {
        docs,
        expires,
      };

      // Invalidate if any cached results have this doc, and the cache is not yet expired
      if (foundIndex !== -1 && expires > now) {
        next.expires = now;
      }

      if (foundIndex === -1 && matchesQuery) {
        next.docs = [...docs, docToUpsert];
      }

      if (foundIndex !== -1 && matchesQuery) {
        next.docs = docs.map((doc) =>
          doc.author === docToUpsert.author && doc.path === docToUpsert.path
            ? docToUpsert
            : doc
        );
      }

      this._queryCache.set(query || this._emptyQuery, next);
    }

    console.log(this._queryCache.entries());
    console.log("SENDING FROM CACHE");

    this.onWrite.send({
      kind: "DOCUMENT_WRITE",
      document: docToUpsert,
      fromSessionId: this.sessionId,
      isLocal: true,
      isLatest: true,
    });
  }

  discardExpiredDocuments() {
    this._assertNotClosed();

    let now = this._now || Date.now() * 1000;
    this._queryCache.forEach(({ docs, expires }, key, map) => {
      if (docs.some((doc) => documentIsExpired(doc, now))) {
        map.set(key, {
          docs: docs.filter((doc) => !documentIsExpired(doc, now)),
          expires,
        });
      }
    });
  }

  forgetDocuments(q: QueryForForget) {
    this._assertNotClosed();

    let query = cleanUpQuery(q);

    if (query.limit === 0 || query.limitBytes === 0) {
      return;
    }
    if (query.history !== "all") {
      throw new ValidationError(
        'forgetDocuments can only be called with history: "all"',
      );
    }

    this._queryCache.forEach(({ docs, expires }, key, map) => {
      if (docs.some((doc) => queryMatchesDoc(query, doc))) {
        map.set(key, {
          docs: docs.filter((doc) => !queryMatchesDoc(query, doc)),
          expires,
        });
      }
    });

    this._backingStorage.forgetDocuments(q);
  }

  _close(opts: { delete: boolean }) {
    this._queryCache.clear();
    this._config = {};

    this._backingStorage._close(opts);
  }
}
