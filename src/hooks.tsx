import * as React from 'react';
import {
  AuthorKeypair,
  IStorage,
  StorageMemory,
  ValidatorEs4,
  syncLocalAndHttp,
  QueryOpts,
  Document,
  isErr,
  EarthstarError,
  WriteResult,
  ValidationError,
  WriteEvent,
} from 'earthstar';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useLocalStorage } from '@rehooks/local-storage';
import { makeStorageKey } from './util';
import {
  CurrentAuthorContext,
  CurrentWorkspaceContext,
  IsLiveContext,
  PubsContext,
  StorageContext,
} from './contexts';

export function useWorkspaces() {
  const [storages] = useStorages();

  return Object.keys(storages);
}

export function useAddWorkspace() {
  const [storages, setStorages] = useStorages();

  return React.useCallback(
    (address: string) => {
      if (storages[address]) {
        return void 0;
      }

      try {
        const newStorage = new StorageMemory([ValidatorEs4], address);

        setStorages(prev => ({
          ...prev,
          [address]: newStorage,
        }));

        return void 0;
      } catch (err) {
        if (isErr(err)) {
          return err;
        }

        return new EarthstarError('Something went wrong!');
      }
    },
    [setStorages, storages]
  );
}

export function useRemoveWorkspace() {
  const [storages, setStorages] = useStorages();
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  return React.useCallback(
    (address: string) => {
      if (currentWorkspace === address) {
        setCurrentWorkspace(null);
      }

      setStorages(prev => {
        const prevCopy = { ...prev };

        delete prevCopy[address];

        return prevCopy;
      });

      storages[address]?.deleteAndClose();
    },
    [setStorages, currentWorkspace, setCurrentWorkspace, storages]
  );
}

export function useWorkspacePubs(
  workspaceAddress?: string
): [string[], (pubs: React.SetStateAction<string[]>) => void] {
  const [existingPubs, setPubs] = usePubs();
  const [currentWorkspace] = useCurrentWorkspace();

  const address = workspaceAddress || currentWorkspace;
  const workspacePubs = address ? existingPubs[address] || [] : [];

  const setWorkspacePubs = React.useCallback(
    (pubs: React.SetStateAction<string[]>) => {
      if (!address) {
        console.warn('Tried to set pubs on an unknown workspace');
        return;
      }

      setPubs(({ [address]: prevWorkspacePubs, ...rest }) => {
        if (Array.isArray(pubs)) {
          return { ...rest, [address]: Array.from(new Set(pubs)) };
        }
        const next = pubs(prevWorkspacePubs || []);
        return { ...rest, [address]: Array.from(new Set(next)) };
      });
    },
    [setPubs, address]
  );

  return [workspacePubs, setWorkspacePubs];
}

export function usePubs(): [
  Record<string, string[]>,
  React.Dispatch<React.SetStateAction<Record<string, string[]>>>
] {
  const { pubs, setPubs } = React.useContext(PubsContext);

  return [pubs, setPubs];
}

export function useCurrentAuthor(): [
  AuthorKeypair | null,
  React.Dispatch<React.SetStateAction<AuthorKeypair | null>>
] {
  const { currentAuthor, setCurrentAuthor } = React.useContext(
    CurrentAuthorContext
  );

  return [currentAuthor, setCurrentAuthor];
}

export function useCurrentWorkspace(): [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>
] {
  const workspaces = useWorkspaces();
  const { currentWorkspace, setCurrentWorkspace } = React.useContext(
    CurrentWorkspaceContext
  );

  React.useEffect(() => {
    if (currentWorkspace && workspaces.includes(currentWorkspace) === false) {
      console.warn(
        `Tried to set current workspace to ${currentWorkspace}, which is not a known workspace.`
      );
      setCurrentWorkspace(null);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  return [currentWorkspace, setCurrentWorkspace];
}

export function useSync() {
  const [storages] = useStorages();
  const [pubs] = usePubs();

  return React.useCallback(
    (address: string) => {
      return new Promise((resolve, reject) => {
        const storage = storages[address];

        if (!storage) {
          reject(new Error('Workspace not found'));
        }

        const workspacePubs = pubs[address];

        if (!workspacePubs) {
          reject(new Error('No pubs found for workspace'));
        }

        Promise.all(
          workspacePubs.map(pubUrl => syncLocalAndHttp(storage, pubUrl))
        )
          .then(resolve)
          .catch(reject);
      });
    },
    [pubs, storages]
  );
}

export function usePaths(query: QueryOpts, workspaceAddress?: string) {
  const {
    pathPrefix,
    lowPath,
    highPath,
    contentIsEmpty,
    includeHistory,
    participatingAuthor,
    path,
    versionsByAuthor,
    now,
    limit,
  } = query;

  const storage = useStorage(workspaceAddress);

  if (!storage) {
    console.warn(`Couldn't find workspace with address ${workspaceAddress}`);
  }

  const queryMemo: QueryOpts = React.useMemo(
    () => ({
      pathPrefix,
      lowPath,
      highPath,
      contentIsEmpty,
      includeHistory,
      participatingAuthor,
      path,
      versionsByAuthor,
      now,
      limit,
    }),
    [
      pathPrefix,
      lowPath,
      highPath,
      contentIsEmpty,
      includeHistory,
      participatingAuthor,
      path,
      versionsByAuthor,
      now,
      limit,
    ]
  );

  const paths = React.useMemo(() => storage?.paths(queryMemo) || [], [
    queryMemo,
    storage,
  ]);

  const [localPaths, setLocalPaths] = React.useState(paths);

  useDeepCompareEffect(() => {
    const paths = storage?.paths(query) || [];
    setLocalPaths(paths);
  }, [query, setLocalPaths]);

  const onWrite = React.useCallback(
    event => {
      if (!storage) {
        return;
      }

      if (
        queryMemo.pathPrefix &&
        !event.document.path.startsWith(queryMemo.pathPrefix)
      ) {
        return;
      }

      if (
        queryMemo.lowPath &&
        queryMemo.lowPath <= event.document.path === false
      ) {
        return;
      }

      if (
        queryMemo.highPath &&
        event.document.path < queryMemo.highPath === false
      ) {
        return;
      }

      if (queryMemo.contentIsEmpty && event.document.content !== '') {
        return;
      }

      if (queryMemo.contentIsEmpty === false && event.document.content === '') {
        return;
      }

      setLocalPaths(storage.paths(queryMemo));
    },
    [queryMemo, storage]
  );

  useSubscribeToStorages({
    workspaces: storage ? [storage.workspace] : undefined,
    includeHistory: query.includeHistory,
    onWrite,
  });

  return localPaths;
}

export function useDocument(
  path: string,
  workspaceAddress?: string
): [
  Document | undefined,
  (
    content: string,
    deleteAfter?: number | null | undefined
  ) => WriteResult | ValidationError,
  () => void
] {
  const [currentAuthor] = useCurrentAuthor();

  const storage = useStorage(workspaceAddress);

  const [localDocument, setLocalDocument] = React.useState(
    storage?.getDocument(path)
  );

  React.useEffect(() => {
    setLocalDocument(storage?.getDocument(path));
  }, [workspaceAddress, path, storage]);

  const onWrite = React.useCallback(
    event => {
      setLocalDocument(event.document);
    },
    [setLocalDocument]
  );

  useSubscribeToStorages({
    workspaces: storage ? [storage.workspace] : undefined,
    paths: [path],
    onWrite,
  });

  const set = React.useCallback(
    (content: string, deleteAfter?: number | null | undefined) => {
      if (!storage) {
        return new ValidationError(
          `useDocument couldn't get the workspace ${workspaceAddress}`
        );
      }

      if (!currentAuthor) {
        console.warn('Tried to set a document when no current author was set.');
        return new ValidationError(
          'Tried to set a document when no current author was set.'
        );
      }

      const result = storage.set(currentAuthor, {
        format: 'es.4',
        path,
        content,
        deleteAfter,
      });

      if (isErr(result)) {
        console.group();
        console.warn(`There was a problem setting the document at ${path}:`);
        console.warn(result.message);
        console.groupEnd();
      }

      return result;
    },
    [path, currentAuthor, workspaceAddress, storage]
  );

  const deleteDoc = () => {
    set('');
  };

  return [localDocument, set, deleteDoc];
}

export function useDocuments(query: QueryOpts, workspaceAddress?: string) {
  const storage = useStorage(workspaceAddress);
  const fetchedDocs =
    storage?.paths(query).map(path => storage?.getDocument(path) as Document) ||
    [];
  const [docs, setDocs] = React.useState(fetchedDocs);

  useDeepCompareEffect(() => {
    setDocs(
      storage
        ?.paths(query)
        .map(path => storage?.getDocument(path) as Document) || []
    );
  }, [storage, query, setDocs]);

  useSubscribeToStorages({
    workspaces: storage ? [storage.workspace] : undefined,
    onWrite: event => {
      const paths = storage?.paths(query);
      if (paths?.includes(event.document.path)) {
        const fetchedDocs =
          paths?.map(path => storage?.getDocument(path) as Document) || [];
        setDocs(fetchedDocs);
      }
    },
  });

  return docs;
}

export function useStorages(): [
  Record<string, IStorage>,
  React.Dispatch<React.SetStateAction<Record<string, IStorage>>>
] {
  const { storages, setStorages } = React.useContext(StorageContext);

  return [storages, setStorages];
}

export function useSubscribeToStorages(options: {
  workspaces?: string[];
  paths?: string[];
  includeHistory?: boolean;
  onWrite: (event: WriteEvent) => void;
}) {
  const [storages] = useStorages();

  useDeepCompareEffect(() => {
    const onWrite = (event: WriteEvent) => {
      if (event.isLatest === false && options.includeHistory !== true) {
        return;
      }

      options.onWrite(event);
    };

    const unsubscribes = Object.values(storages)
      .filter(storage => {
        if (options.workspaces) {
          return options.workspaces.includes(storage.workspace);
        }

        return true;
      })
      .map(storage => {
        return storage.onWrite.subscribe(event => {
          if (options.paths) {
            if (options.paths.includes(event.document.path)) {
              onWrite(event);
            }
            return;
          }

          onWrite(event);
        });
      });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [storages, options]);
}

export function useInvitation(invitationCode: string) {
  const add = useAddWorkspace();
  const [existingPubs, setPubs] = usePubs();

  try {
    const url = new URL(invitationCode);

    const isEarthstarURL = url.protocol === 'earthstar:';

    if (!isEarthstarURL) {
      return new EarthstarError('Invitation not a valid Earthstar URL');
    }

    const version = url.searchParams.get('v');

    if (version !== '1') {
      return new EarthstarError(
        'Unrecognised Earthstar invitation format version'
      );
    }

    const workspace = url.searchParams.get('workspace');

    if (workspace === null) {
      return new EarthstarError(
        'No workspace found in Earthstar invitation URL'
      );
    }

    const plussedWorkspace = workspace.replace(' ', '+');

    const workspaceIsValid = ValidatorEs4._checkWorkspaceIsValid(
      plussedWorkspace
    );

    if (isErr(workspaceIsValid)) {
      return workspaceIsValid;
    }

    const pubs = url.searchParams.getAll('pub');

    try {
      pubs.forEach(pubUrl => new URL(pubUrl));
    } catch {
      return new EarthstarError('Malformed Pub URL found');
    }

    const redeem = (excludedPubs: string[] = []) => {
      add(plussedWorkspace);

      // In case the workspace in the invitation already has known pubs
      // We want to keep those around.
      const existingWorkspacePubs = existingPubs[plussedWorkspace] || [];

      const nextPubs = Array.from(
        new Set([
          ...existingWorkspacePubs,
          ...pubs.filter(pubUrl => !excludedPubs.includes(pubUrl)),
        ])
      );

      setPubs(prevPubs => ({
        ...prevPubs,
        [plussedWorkspace]: nextPubs,
      }));
    };

    return { redeem, workspace: plussedWorkspace, pubs };
  } catch {
    return new EarthstarError('Not a valid Earthstar URL');
  }
}

export function useMakeInvitation(
  excludedPubs: string[] = [],
  workspaceAddress?: string
) {
  const [pubs] = useWorkspacePubs(workspaceAddress);
  const [currentWorkspace] = useCurrentWorkspace();
  const address = workspaceAddress || currentWorkspace;

  const pubsToUse = pubs.filter(pubUrl => !excludedPubs.includes(pubUrl));
  const pubsString = pubsToUse.map(pubUrl => `&pub=${pubUrl}`).join('');

  if (!address) {
    return "Couldn't create invitation code!";
  }

  return `earthstar:///?workspace=${address}${pubsString}&v=1`;
}

export function useIsLive(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>
] {
  const { isLive, setIsLive } = React.useContext(IsLiveContext);

  return [isLive, setIsLive];
}

export function useStorage(workspaceAddress?: string) {
  const [currentWorkspace] = useCurrentWorkspace();
  const [storages] = useStorages();

  const address = workspaceAddress || currentWorkspace;

  return address ? storages[address] : null;
}

type WorkspaceRecords = Record<
  string,
  Record<string, Record<string, Document>>
>;

export function useLocalStorageEarthstarSettings(storageKey: string) {
  const lsAuthorKey = makeStorageKey(storageKey, 'current-author');
  const lsPubsKey = makeStorageKey(storageKey, 'pubs');
  const lsStoragesKey = makeStorageKey(storageKey, 'storages');
  const lsCurrentWorkspaceKey = makeStorageKey(storageKey, 'current-workspace');
  const lsIsLiveKey = makeStorageKey(storageKey, 'is-live');

  // load the initial state from localStorage
  const [workspacesDocsInStorage] = useLocalStorage<WorkspaceRecords>(
    lsStoragesKey,
    {}
  );
  const [initPubs] = useLocalStorage<Record<string, string[]>>(lsPubsKey, {});
  const [initCurrentAuthor] = useLocalStorage<AuthorKeypair>(lsAuthorKey);
  const [initCurrentWorkspace] = useLocalStorage(lsCurrentWorkspaceKey);
  const [initIsLive] = useLocalStorage(lsIsLiveKey);

  const initWorkspaces = Object.entries(workspacesDocsInStorage).map(
    ([workspaceAddress, docs]) => {
      const storage = new StorageMemory([ValidatorEs4], workspaceAddress);
      // (this is a hack that knows too much about the internal structure of StorageMemory)
      // (it would be better to ingest each document one by one, but also a lot slower)
      storage._docs = docs;
      return storage;
    }
  );

  return {
    initWorkspaces,
    initPubs,
    initCurrentAuthor,
    initCurrentWorkspace,
    initIsLive,
  };
}
