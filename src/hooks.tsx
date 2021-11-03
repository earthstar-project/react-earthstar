import * as React from "react";
import {
  AuthorKeypair,
  checkWorkspaceIsValid,
  EarthstarError,
  isErr,
  StorageCache,
} from "stone-soup";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import {
  AddWorkspaceContext,
  CurrentAuthorContext,
  CurrentWorkspaceContext,
  IsLiveContext,
  PeerContext,
  PubsContext,
} from "./contexts";
import { getLocalStorage, makeStorageKey } from "./util";

export function usePeer() {
  const peer = React.useContext(PeerContext);

  return peer;
}

export function useWorkspacePubs(
  workspaceAddress?: string,
): [string[], (pubs: React.SetStateAction<string[]>) => void] {
  const [existingPubs, setPubs] = usePubs();
  const [currentWorkspace] = useCurrentWorkspace();

  const address = workspaceAddress || currentWorkspace;
  const workspacePubs = address ? existingPubs[address] || [] : [];

  const setWorkspacePubs = React.useCallback(
    (pubs: React.SetStateAction<string[]>) => {
      if (!address) {
        console.warn("Tried to set pubs on an unknown workspace");
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
    [setPubs, address],
  );

  return [workspacePubs, setWorkspacePubs];
}

export function usePubs(): [
  Record<string, string[]>,
  React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
] {
  const { pubs, setPubs } = React.useContext(PubsContext);

  return [pubs, setPubs];
}

export function useCurrentAuthor(): [
  AuthorKeypair | null,
  React.Dispatch<React.SetStateAction<AuthorKeypair | null>>,
] {
  const { currentAuthor, setCurrentAuthor } = React.useContext(
    CurrentAuthorContext,
  );

  return [currentAuthor, setCurrentAuthor];
}

export function useCurrentWorkspace(): [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>,
] {
  const peer = usePeer();
  const workspaces = peer.workspaces();

  const { currentWorkspace, setCurrentWorkspace } = React.useContext(
    CurrentWorkspaceContext,
  );

  React.useEffect(() => {
    if (currentWorkspace && workspaces.includes(currentWorkspace) === false) {
      console.warn(
        `Tried to set current workspace to ${currentWorkspace}, which is not a known workspace.`,
      );
      setCurrentWorkspace(null);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  return [currentWorkspace, setCurrentWorkspace];
}

/*
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
*/

function clone<T>(instance: T): T {
  return Object.assign(
    Object.create(
      // Set the prototype of the new object to the prototype of the instance.
      // Used to allow new object behave like class instance.
      Object.getPrototypeOf(instance),
    ),
    // Prevent shallow copies of nested structures like arrays, etc
    JSON.parse(JSON.stringify(instance)),
  );
}

export function useStorage(workspaceAddress?: string) {
  /*
  const [currentWorkspace] = useCurrentWorkspace();
  const peer = usePeer();

  const address = workspaceAddress || currentWorkspace;

  const [currentStorage] = React.useState(() => {
    return address ? peer.getStorage(address) : undefined;
  });

  if (!currentStorage) {
    throw new Error("Tried to use useStorage with no workspace specified!");
  }

  const storageCache = new StorageCache(currentStorage);

  const subscribe = React.useCallback((notify: () => void) => {
    console.log('SUBSCRIBED')
    
    const unsub = storageCache.onCacheUpdated(() => {
      notify();
    });

    return unsub;
  }, []);

  const getSnapshot = () => storageCache;

  return useSyncExternalStore(subscribe, getSnapshot);
  */
  
  const [currentWorkspace] = useCurrentWorkspace();
  const peer = usePeer();
  
  const storages = peer.storages()

  const address = workspaceAddress || currentWorkspace;

  const [, reRender] = React.useState(true);

  const [currentStorage, setCurrentStorage] = React.useState(() => {
    return address ? peer.getStorage(address) : null;
  });

  if (!currentStorage) {
    throw new Error('Tried to use useStorage with no workspace specified!');
  }

  const cacheRef = React.useRef(new StorageCache(currentStorage));

  React.useEffect(() => {
    if (address && address !== currentStorage.workspace) {
      setCurrentStorage(storages[address]);
      console.log('remaking proxy');
      cacheRef.current?._onCacheUpdatedCallbacks.clear();
      cacheRef.current = new StorageCache(storages[address]);
      reRender(prev => !prev);
    }
  }, [address, storages, currentStorage.workspace]);

  React.useEffect(() => {
    const unsub = cacheRef.current?.onCacheUpdated(() => {
      reRender(prev => !prev);
    });

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [currentStorage]);

  return cacheRef.current as StorageCache;
}

export function useInvitation(invitationCode: string) {
  const addWorkspace = React.useContext(AddWorkspaceContext);
  const [existingPubs, setPubs] = usePubs();

  try {
    const url = new URL(invitationCode);

    const isEarthstarURL = url.protocol === "earthstar:";

    if (!isEarthstarURL) {
      return new EarthstarError("Invitation not a valid Earthstar URL");
    }

    const version = url.searchParams.get("v");

    if (version !== "1") {
      return new EarthstarError(
        "Unrecognised Earthstar invitation format version",
      );
    }

    const workspace = url.searchParams.get("workspace");

    if (workspace === null) {
      return new EarthstarError(
        "No workspace found in Earthstar invitation URL",
      );
    }

    const plussedWorkspace = workspace.replace(" ", "+");

    const workspaceIsValid = checkWorkspaceIsValid(plussedWorkspace);

    if (isErr(workspaceIsValid)) {
      return workspaceIsValid;
    }

    const pubs = url.searchParams.getAll("pub");

    try {
      pubs.forEach((pubUrl) => new URL(pubUrl));
    } catch {
      return new EarthstarError("Malformed Pub URL found");
    }

    const redeem = (excludedPubs: string[] = []) => {
      addWorkspace(plussedWorkspace);

      // In case the workspace in the invitation already has known pubs
      // We want to keep those around.
      const existingWorkspacePubs = existingPubs[plussedWorkspace] || [];

      const nextPubs = Array.from(
        new Set([
          ...existingWorkspacePubs,
          ...pubs.filter((pubUrl) => !excludedPubs.includes(pubUrl)),
        ]),
      );

      setPubs((prevPubs) => ({
        ...prevPubs,
        [plussedWorkspace]: nextPubs,
      }));
    };

    return { redeem, workspace: plussedWorkspace, pubs };
  } catch {
    return new EarthstarError("Not a valid Earthstar URL");
  }
}

export function useMakeInvitation(
  excludedPubs: string[] = [],
  workspaceAddress?: string,
) {
  const [pubs] = useWorkspacePubs(workspaceAddress);
  const [currentWorkspace] = useCurrentWorkspace();
  const address = workspaceAddress || currentWorkspace;

  const pubsToUse = pubs.filter((pubUrl) => !excludedPubs.includes(pubUrl));
  const pubsString = pubsToUse.map((pubUrl) => `&pub=${pubUrl}`).join("");

  if (!address) {
    return "Couldn't create invitation code!";
  }

  return `earthstar:///?workspace=${address}${pubsString}&v=1`;
}

export function useIsLive(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
] {
  const { isLive, setIsLive } = React.useContext(IsLiveContext);

  return [isLive, setIsLive];
}

export function useLocalStorageEarthstarSettings(storageKey: string) {
  const lsAuthorKey = makeStorageKey(storageKey, "current-author");
  const lsPubsKey = makeStorageKey(storageKey, "pubs");
  const lsWorkspacesKey = makeStorageKey(storageKey, "workspaces");
  const lsCurrentWorkspaceKey = makeStorageKey(storageKey, "current-workspace");
  const lsIsLiveKey = makeStorageKey(storageKey, "is-live");

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
