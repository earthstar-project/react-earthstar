import * as React from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
  AuthorKeypair,
  ClientSettings,
  IPeer,
  MultiformatReplica,
  ReplicaCache,
} from "earthstar";

export const ClientSettingsContext = React.createContext(new ClientSettings());

/** Subscribe to a given peer's replicas as they change. */
export function usePeerReplicas(peer: IPeer) {
  const [replicas, setReplicas] = React.useState(peer.replicas());

  React.useEffect(() => {
    const unsub = peer.onReplicasChange((replicas) => {
      setReplicas(Array.from(replicas.values()));
    });

    return () => {
      unsub();
    };
  }, [peer]);

  return replicas;
}

/** Subscribe to an `Earthstar.ClientSetting`'s author.
*
*@returns A tuple where the first element is the author, and the second element a function to update the author.
 */
export function useAuthorSettings(): [
  AuthorKeypair | null,
  (author: AuthorKeypair | null) => void,
] {
  const settings = React.useContext(ClientSettingsContext);

  const [author, setAuthor] = React.useState(() => settings.author);

  React.useEffect(() => {
    const unsub = settings.onAuthorChanged((newAuthor) => {
      setAuthor(newAuthor);
    });

    return unsub;
  }, [settings]);

  const set = React.useCallback((newAuthor: AuthorKeypair | null) => {
    settings.author = newAuthor;
  }, [settings]);

  return [author, set];
}

export function useShareSettings(): [
  string[],
  (shareToAdd: string) => void,
  (shareToRemove: string) => void,
] {
  const settings = React.useContext(ClientSettingsContext);

  const [shares, setShares] = React.useState(() => settings.shares);

  React.useEffect(() => {
    const unsub = settings.onSharesChanged((newShares) => {
      setShares(newShares);
    });

    return unsub;
  }, [settings]);
  
  const addShare = React.useCallback((addr: string) => {
    settings.addShare(addr)
  }, [settings])

  const removeShare = React.useCallback((addr: string) => {
    settings.removeShare(addr)
  }, [settings])


  return [shares, addShare, removeShare];
}

export function useShareSecretSettings(): [
  Record<string, string>,
  (share: string, secret: string) => Promise<void>,
  (shareAddrOfSecretToRemove: string) => void,
] {
  const settings = React.useContext(ClientSettingsContext);

  const [secrets, setSecrets] = React.useState(() => settings.shareSecrets);

  React.useEffect(() => {
    const unsub = settings.onShareSecretsChanged((newSecrets) => {
      setSecrets(newSecrets);
    });

    return unsub;
  }, [settings]);
  
  const addSecret = React.useCallback(async (addr: string, secret: string) => {
    await settings.addSecret(addr, secret)
  }, [settings])
  
  const removeSecret = React.useCallback((addr: string) => {
    settings.removeSecret(addr)
  }, [settings])


  return [secrets, addSecret, removeSecret];
}

export function useServerSettings(): [
  string[],
  (serverToAdd: string) => void,
  (serverToRemove: string) => void,
] {
  const settings = React.useContext(ClientSettingsContext);

  const [servers, setServers] = React.useState(() => settings.servers);

  React.useEffect(() => {
    const unsub = settings.onServersChanged((newServers) => {
      setServers(newServers);
    });

    return unsub;
  }, [settings]);
  
  const addServer = React.useCallback((url: string) => {
    settings.addServer(url)
  }, [settings])
  
  const removeServer = React.useCallback((url: string) => {
    settings.removeServer(url)
  }, [settings])


  return [servers, addServer, removeServer];
}

export function useReplica(replica: MultiformatReplica) {
  const replicaCache = React.useMemo(
    () => {
      if (!replica) {
        throw new Error("Tried to use useReplica with no share specified!");
      }

      return new ReplicaCache(replica, 1000, (cb) => {
        unstable_batchedUpdates(cb);
      });
    },
    [replica],
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

/*
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
*/

/*
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
  shareAddress: string,
  includedPubs: string[] = [],
) {
  const [pubs] = useReplicaServers();
  const address = shareAddress;

  const pubsToUse = pubs.filter((pubUrl) => includedPubs.includes(pubUrl));
  const pubsString = pubsToUse.map((pubUrl) => `&pub=${pubUrl}`).join("");

  if (!address) {
    return "Couldn't create invitation code!";
  }

  return `earthstar:///?workspace=${address}${pubsString}&v=1`;
}
*/
