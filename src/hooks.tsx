import * as React from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
  AuthorKeypair,
  checkShareIsValid,
  EarthstarError,
  isErr,
  Peer,
  ReplicaCache,
  Syncer,
  SyncerStatus,
} from "earthstar";
import {
  AddShareContext,
  CurrentShareContext,
  KeypairContext,
  PeerContext,
  ReplicaServersContext,
} from "./contexts";
import { getLocalStorage, makeStorageKey } from "./util";

export function usePeer() {
  const peer = React.useContext(PeerContext);

  const [trigger, setTrigger] = React.useState(true);

  const memoPeer = React.useMemo(() => peer, [trigger]);

  React.useEffect(() => {
    const unsub = peer.onReplicasChange(() => {
      setTrigger((prev) => !prev);
    });

    return () => {
      unsub();
    };
  }, [peer]);

  return memoPeer;
}

export function useAddShare() {
  return React.useContext(AddShareContext);
}

export function useReplicaServers(): [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>,
] {
  const { replicaServers, setReplicaServers } = React.useContext(
    ReplicaServersContext,
  );

  return [replicaServers, setReplicaServers];
}

export function useKeypair(): [
  AuthorKeypair | null,
  React.Dispatch<React.SetStateAction<AuthorKeypair | null>>,
] {
  const { keypair, setKeypair } = React.useContext(
    KeypairContext,
  );

  return [keypair, setKeypair];
}

export function useCurrentShare(): [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>,
] {
  const peer = usePeer();

  const { currentShare, setCurrentShare } = React.useContext(
    CurrentShareContext,
  );

  React.useEffect(() => {
    if (currentShare && peer.hasShare(currentShare) === false) {
      console.warn(
        `Tried to set current workspace to ${currentShare}, which is not a known workspace.`,
      );
      setCurrentShare(null);
    }
  }, [currentShare, setCurrentShare]);

  return [currentShare, setCurrentShare];
}

export function useReplica(shareAddress?: string | undefined) {
  const [currentShare] = useCurrentShare();
  const peer = usePeer();

  const address = shareAddress || currentShare;

  const replicaCache = React.useMemo(
    () => {
      const replica = address ? peer.getReplica(address) : undefined;

      if (!replica) {
        throw new Error("Tried to use useReplica with no share specified!");
      }

      return new ReplicaCache(replica, 1000, (cb) => {
        unstable_batchedUpdates(cb);
      });
    },
    [address, peer],
  );

  const [, setTrigger] = React.useState(true);

  React.useLayoutEffect(() => {
    const unsub = replicaCache.onCacheUpdated(() => {
      setTrigger((prev) => !prev);
    });

    return () => {
      unsub();
      replicaCache.close();
    };
  }, [replicaCache]);

  return replicaCache;

  // Keeping the below around for React 18.
  /*
    const replicaCache = React.useMemo(() => {
      const replica = address ? peer.getReplica(address) : undefined;
         if (!replica) {
        throw new Error("Tried to use useReplica with no share specified!");
      }
         return new ReplicaCache(replica, 1000);
       [address, peer])
       const [currentVersion, setVersion] = React.useState(replicaCache.version);
       const memoReplica = React.useMemo(() => {
      return replicaCache;
       [currentVersion, replicaCache]);
       React.useEffect(() => {
      replicaCache.onCacheUpdated(() => {
        setVersion(replicaCache.version);

      ;
         nst subscribe = React.useCallback((onStoreChange: () => void) => {
        turn memoReplica.onCacheUpdated(() => {
          StoreChange();
        ;
       [memoReplica, replicaCache]);
         nst getSnapshot = React.useCallback(() => memoReplica, []);
         turn useSyncExternalStoreWithSelector(
        bscribe,
        tSnapshot,
        tSnapshot,
        ache) => cache,
        acheA, cacheB) => cacheA.version === cacheB.version,
      */
}

export function useSync(
  target: string | Peer,
): [Syncer<undefined, unknown>, SyncerStatus] {
  const peer = usePeer();

  const syncer = peer.sync(target);

  const [status, setStatus] = React.useState(syncer.getStatus);

  React.useEffect(() => {
    return syncer.onStatusChange((status) => {
      setStatus(status);
    });
  }, [syncer]);

  return [syncer, status];
}

export function useInvitation(invitationCode: string) {
  const addShare = React.useContext(AddShareContext);
  const [, setPubs] = useReplicaServers();

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

    const shareIsValid = checkShareIsValid(plussedWorkspace);

    if (isErr(shareIsValid)) {
      return shareIsValid;
    }

    const pubs = url.searchParams.getAll("pub");

    try {
      pubs.forEach((pubUrl) => new URL(pubUrl));
    } catch {
      return new EarthstarError("Malformed Pub URL found");
    }

    const redeem = (excludedPubs: string[] = []) => {
      addShare(plussedWorkspace);

      const nextPubs = Array.from(
        new Set([
          ...pubs.filter((pubUrl) => !excludedPubs.includes(pubUrl)),
        ]),
      );

      setPubs((prevPubs) =>
        Array.from(
          new Set([
            ...prevPubs,
            ...nextPubs,
          ]),
        )
      );
    };

    return { redeem, workspace: plussedWorkspace, pubs };
  } catch {
    return new EarthstarError("Not a valid Earthstar URL");
  }
}

export function useMakeInvitation(
  includedPubs: string[] = [],
  shareAddress?: string,
) {
  const [pubs] = useReplicaServers();
  const [currentShare] = useCurrentShare();
  const address = shareAddress || currentShare;

  const pubsToUse = pubs.filter((pubUrl) => includedPubs.includes(pubUrl));
  const pubsString = pubsToUse.map((pubUrl) => `&pub=${pubUrl}`).join("");

  if (!address) {
    return "Couldn't create invitation code!";
  }

  return `earthstar:///?workspace=${address}${pubsString}&v=1`;
}

export function useLocalStorageEarthstarSettings(storageKey: string) {
  const lsAuthorKey = makeStorageKey(storageKey, "author");
  const lsServersKey = makeStorageKey(storageKey, "replica-servers");
  const lsSharesKey = makeStorageKey(storageKey, "shares");
  const lsCurrentShareKey = makeStorageKey(storageKey, "current-share");
  const lsShareSecretsKey = makeStorageKey(storageKey, "share-secrets");
  

  const allKeys = React.useMemo(
    () => [
      lsAuthorKey,
      lsServersKey,
      lsSharesKey,
      lsCurrentShareKey,
  lsShareSecretsKey
    ],
    [lsAuthorKey, lsServersKey, lsSharesKey, lsCurrentShareKey, lsShareSecretsKey],
  );

  // load the initial state from localStorage
  const initShares = getLocalStorage<string[]>(lsSharesKey);
  const initReplicaServers = getLocalStorage<string[]>(lsServersKey);
  const initIdentity = getLocalStorage<AuthorKeypair>(lsAuthorKey);
  const initCurrentShare = getLocalStorage<string>(lsCurrentShareKey);
    const initShareSecrets = getLocalStorage<Record<string, string>>(lsShareSecretsKey)


  const [, setTrigger] = React.useState(true);

  const onStorage = React.useCallback((event: StorageEvent) => {
    console.log(event.key)
    if (event.key && allKeys.includes(event.key)) {
      
      setTrigger((prev) => !prev);
    }
  }, [allKeys]);

  React.useEffect(() => {
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [onStorage]);

  return {
    initShares: initShares || [],
    initShareSecrets: initShareSecrets || {},
    initReplicaServers: initReplicaServers || [],
    initIdentity: initIdentity || null,
    initCurrentShare: initCurrentShare || null,
  };
}
