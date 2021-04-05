import * as React from 'react';
import {
  AuthorKeypair,
  ValidatorEs4,
  Query,
  Document,
  isErr,
  EarthstarError,
  WriteResult,
  ValidationError,
  WriteEvent,
  IStorage,
  syncLocalAndHttp,
  queryMatchesDoc,
} from 'earthstar';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { getLocalStorage, makeStorageKey, useMemoQueryOpts } from './util';
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
  const { storages, addStorage } = React.useContext(StorageContext);

  return React.useCallback(
    (address: string) => {
      if (storages[address]) {
        return void 0;
      }

      try {
        addStorage(address);

        return void 0;
      } catch (err) {
        if (isErr(err)) {
          return err;
        }

        return new EarthstarError('Something went wrong!');
      }
    },
    [storages]
  );
}

export function useRemoveWorkspace(): (address: string) => void {
  const [storages, setStorages] = useStorages();
  const [pubs, setPubs] = usePubs();
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

      const storage = storages[address];

      if (storage) {
        const nextPubs = { ...pubs };
        delete nextPubs[address];
        setPubs(nextPubs);
      }
    },
    [
      setStorages,
      currentWorkspace,
      setCurrentWorkspace,
      storages,
      pubs,
      setPubs,
    ]
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

export function usePaths(query: Query, workspaceAddress?: string): string[] {
  const storage = useStorage(workspaceAddress);

  if (!storage) {
    console.warn(`Couldn't find workspace with address ${workspaceAddress}`);
  }

  const queryMemo = useMemoQueryOpts(query);

  const [localPaths, setLocalPaths] = React.useState<string[]>(
    storage?.paths(queryMemo) || []
  );

  useDeepCompareEffect(() => {
    setLocalPaths(storage?.paths(queryMemo) || []);
  }, [storage, queryMemo, setLocalPaths]);

  const onWrite = React.useCallback(
    event => {
      if (!storage) {
        return;
      }

      if (!queryMatchesDoc(queryMemo, event.document)) {
        return;
      }

      setLocalPaths(storage.paths(queryMemo) || []);
    },
    [queryMemo, storage]
  );

  useSubscribeToStorages({
    workspaces: storage ? [storage.workspace] : undefined,
    history: query.history,
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
  () => WriteResult | ValidationError
] {
  const [currentAuthor] = useCurrentAuthor();

  const storage = useStorage(workspaceAddress);

  const [localDocument, setLocalDocument] = React.useState<
    Document | undefined
  >(storage?.getDocument(path));

  React.useEffect(() => {
    setLocalDocument(storage?.getDocument(path));
  }, [storage, path]);

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

      console.log(storage.getDocument(path));

      setLocalDocument(storage.getDocument(path));

      return result;
    },
    [path, currentAuthor, workspaceAddress, storage]
  );

  const deleteDoc = () => {
    return set('');
  };

  return [localDocument, set, deleteDoc];
}

export function useDocuments(
  query: Query,
  workspaceAddress?: string
): Document[] {
  const storage = useStorage(workspaceAddress);

  const queryMemo = useMemoQueryOpts(query);

  const [docs, setDocs] = React.useState<Document[]>(
    storage?.documents(queryMemo) || []
  );

  React.useEffect(() => {
    setDocs(storage?.documents(queryMemo) || []);
  }, [storage, queryMemo]);

  const onWrite = React.useCallback(
    event => {
      if (queryMatchesDoc(queryMemo, event.document)) {
        setDocs(storage?.documents(queryMemo) || []);
      }
    },
    [storage, setDocs, queryMemo]
  );

  useSubscribeToStorages({
    workspaces: storage ? [storage.workspace] : undefined,
    onWrite,
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
  history?: Query['history'];
  onWrite: (event: WriteEvent) => void;
}) {
  const [storages] = useStorages();

  useDeepCompareEffect(() => {
    const onWrite = (event: WriteEvent) => {
      if (
        event.isLatest === false &&
        options.history &&
        options.history !== 'all'
      ) {
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

  return React.useMemo(() => {
    return address ? storages[address] : null;
  }, [address, storages]);
}

export function useLocalStorageEarthstarSettings(storageKey: string) {
  const lsAuthorKey = makeStorageKey(storageKey, 'current-author');
  const lsPubsKey = makeStorageKey(storageKey, 'pubs');
  const lsWorkspacesKey = makeStorageKey(storageKey, 'workspaces');
  const lsCurrentWorkspaceKey = makeStorageKey(storageKey, 'current-workspace');
  const lsIsLiveKey = makeStorageKey(storageKey, 'is-live');

  // load the initial state from localStorage
  const initWorkspaces = getLocalStorage<string[]>(lsWorkspacesKey);
  const initPubs = getLocalStorage<Record<string, string[]>>(lsPubsKey);
  const initCurrentAuthor = getLocalStorage<AuthorKeypair>(lsAuthorKey);
  const initCurrentWorkspace = getLocalStorage<string>(lsCurrentWorkspaceKey);
  const initIsLive = getLocalStorage<boolean>(lsIsLiveKey);

  return {
    ...(initWorkspaces ? { initWorkspaces } : {}),
    ...(initPubs ? { initPubs } : {}),
    ...(initCurrentAuthor ? { initCurrentAuthor } : {}),
    ...(initCurrentWorkspace ? { initCurrentWorkspace } : {}),
    ...(initIsLive ? { initIsLive } : {}),
  };
}
