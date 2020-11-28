import React from 'react';
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
  OnePubOneWorkspaceSyncer,
} from 'earthstar';
import useDeepCompareEffect from 'use-deep-compare-effect';

const StorageContext = React.createContext<{
  storages: Record<string, IStorage>; // workspace address --> IStorage instance
  setStorages: React.Dispatch<React.SetStateAction<Record<string, IStorage>>>;
}>({ storages: {}, setStorages: () => {} });

const PubsContext = React.createContext<{
  pubs: Record<string, string[]>; // workspace address --> pub urls
  setPubs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}>({ pubs: {}, setPubs: () => {} });

const CurrentAuthorContext = React.createContext<{
  currentAuthor: AuthorKeypair | null;
  setCurrentAuthor: React.Dispatch<React.SetStateAction<AuthorKeypair | null>>;
}>({ currentAuthor: null, setCurrentAuthor: () => {} });

const CurrentWorkspaceContext = React.createContext<{
  currentWorkspace: null | string;
  setCurrentWorkspace: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
});

const IsLiveContext = React.createContext<{
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isLive: true,
  setIsLive: () => {},
});

export function EarthstarPeer({
  initWorkspaces = [],
  initPubs = {},
  initCurrentAuthor = null,
  initCurrentWorkspace = null,
  initIsLive = true,
  children,
}: {
  initWorkspaces?: IStorage[];
  initPubs?: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair | null;
  initCurrentWorkspace?: string | null;
  initIsLive?: boolean;
  children: React.ReactNode;
}) {
  const [storages, setStorages] = React.useState(
    initWorkspaces.reduce<Record<string, IStorage>>((acc, storage) => {
      return { ...acc, [storage.workspace]: storage };
    }, {})
  );

  const [pubs, setPubs] = React.useState(initPubs);

  const [currentAuthor, setCurrentAuthor] = React.useState(initCurrentAuthor);

  const [currentWorkspace, setCurrentWorkspace] = React.useState(
    initCurrentWorkspace && storages[initCurrentWorkspace]
      ? initCurrentWorkspace
      : null
  );
  const [isLive, setIsLive] = React.useState(initIsLive);

  return (
    <StorageContext.Provider value={{ storages, setStorages }}>
      <PubsContext.Provider value={{ pubs, setPubs }}>
        <CurrentAuthorContext.Provider
          value={{ currentAuthor, setCurrentAuthor }}
        >
          <CurrentWorkspaceContext.Provider
            value={{ currentWorkspace, setCurrentWorkspace }}
          >
            <IsLiveContext.Provider value={{ isLive, setIsLive }}>
              {children}
              {Object.keys(storages).map(workspaceAddress => (
                <LiveSyncer
                  key={workspaceAddress}
                  workspaceAddress={workspaceAddress}
                />
              ))}
            </IsLiveContext.Provider>
          </CurrentWorkspaceContext.Provider>
        </CurrentAuthorContext.Provider>
      </PubsContext.Provider>
    </StorageContext.Provider>
  );
}

function LiveSyncer({ workspaceAddress }: { workspaceAddress: string }) {
  const [isLive] = useIsLive();
  const [storages] = useStorages();
  const [pubs] = useWorkspacePubs(workspaceAddress);

  React.useEffect(() => {
    const syncers = pubs.map(
      pubUrl => new OnePubOneWorkspaceSyncer(storages[workspaceAddress], pubUrl)
    );

    if (!isLive) {
      syncers.forEach(syncer => {
        syncer.stopPushStream();
        syncer.stopPullStream();
      });
    } else {
      // Start streaming when isLive changes to true
      syncers.forEach(syncer => {
        syncer.syncOnceAndContinueLive();
      });
    }

    // On cleanup (unmount, value of syncers changes) stop all syncers from pulling and pushing
    return () => {
      syncers.forEach(syncer => {
        syncer.stopPullStream();
        syncer.stopPushStream();
      });
    };
  }, [pubs, isLive, workspaceAddress, storages]);

  return null;
}

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
  workspaceAddress: string
): [string[], (pubs: React.SetStateAction<string[]>) => void] {
  const [existingPubs, setPubs] = usePubs();

  const workspacePubs = existingPubs[workspaceAddress] || [];
  const setWorkspacePubs = React.useCallback(
    (pubs: React.SetStateAction<string[]>) => {
      setPubs(({ [workspaceAddress]: prevWorkspacePubs, ...rest }) => {
        if (Array.isArray(pubs)) {
          return { ...rest, [workspaceAddress]: Array.from(new Set(pubs)) };
        }
        const next = pubs(prevWorkspacePubs || []);
        return { ...rest, [workspaceAddress]: Array.from(new Set(next)) };
      });
    },
    [setPubs, workspaceAddress]
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

export function usePaths(workspaceAddress: string, query: QueryOpts) {
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

  const [storages] = useStorages();

  const storage = React.useMemo(() => storages[workspaceAddress], [
    storages,
    workspaceAddress,
  ]);

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

  const paths = React.useMemo(() => (storage ? storage.paths(queryMemo) : []), [
    queryMemo,
    storage,
  ]);

  const [localPaths, setLocalPaths] = React.useState(paths);

  useDeepCompareEffect(() => {
    const paths = storage ? storage.paths(query) : [];
    setLocalPaths(paths);
  }, [query]);

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
    workspaces: [workspaceAddress],
    includeHistory: query.includeHistory,
    onWrite,
  });

  return localPaths;
}

export function useDocument(
  workspaceAddress: string,
  path: string
): [
  Document | undefined,
  (
    content: string,
    deleteAfter?: number | null | undefined
  ) => WriteResult | ValidationError,
  () => void
] {
  const [storages] = useStorages();
  const [currentAuthor] = useCurrentAuthor();

  const [localDocument, setLocalDocument] = React.useState(
    storages[workspaceAddress]
      ? storages[workspaceAddress].getDocument(path)
      : undefined
  );

  React.useEffect(() => {
    setLocalDocument(
      storages[workspaceAddress]
        ? storages[workspaceAddress].getDocument(path)
        : undefined
    );
  }, [workspaceAddress, path, storages]);

  const onWrite = React.useCallback(
    event => {
      setLocalDocument(event.document);
    },
    [setLocalDocument]
  );

  useSubscribeToStorages({
    workspaces: [workspaceAddress],
    paths: [path],
    onWrite,
  });

  const set = React.useCallback(
    (content: string, deleteAfter?: number | null | undefined) => {
      const storage = storages[workspaceAddress];
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

      return storage.set(currentAuthor, {
        format: 'es.4',
        path,
        content,
        deleteAfter,
      });
    },
    [path, currentAuthor, storages, workspaceAddress]
  );

  const deleteDoc = () => {
    set('');
  };

  return [localDocument, set, deleteDoc];
}

export function useDocuments(workspace: string, query: QueryOpts) {
  const [storages] = useStorages();
  const initialPaths = storages[workspace].paths(query);
  const fetchedDocs = initialPaths.map(
    path => storages[workspace].getDocument(path) as Document
  );
  const [docs, setDocs] = React.useState(fetchedDocs);

  useSubscribeToStorages({
    workspaces: [workspace],
    onWrite: event => {
      const paths = storages[workspace].paths(query);
      const fetchedDocs = paths.map(
        path => storages[workspace].getDocument(path) as Document
      );
      if (paths.includes(event.document.path)) {
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
  workspace: string,
  excludedPubs: string[] = []
) {
  const [pubs] = useWorkspacePubs(workspace);

  const pubsToUse = pubs.filter(pubUrl => !excludedPubs.includes(pubUrl));
  const pubsString = pubsToUse.map(pubUrl => `&pub=${pubUrl}`).join('');

  return `earthstar:///?workspace=${workspace}${pubsString}&v=1`;
}

export function useIsLive(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>
] {
  const { isLive, setIsLive } = React.useContext(IsLiveContext);

  return [isLive, setIsLive];
}
