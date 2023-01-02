import * as React from "react";
import {
  AuthorKeypair,
  SharedSettings,
  IPeer,
  MultiformatReplica,
  ReplicaCache,
  ValidationError,
} from "earthstar";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

export const SharedSettingsContext = React.createContext(new SharedSettings());

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
 * @returns A tuple where the first element is the author, and the second element a function to update the author.
 */
export function useAuthorSettings(): [
  AuthorKeypair | null,
  (author: AuthorKeypair | null) => void,
] {
  const settings = React.useContext(SharedSettingsContext);

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
  (shareToAdd: string) => ValidationError | string[],
  (shareToRemove: string) => ValidationError | string[],
] {
  const settings = React.useContext(SharedSettingsContext);

  const [shares, setShares] = React.useState(() => settings.shares);

  React.useEffect(() => {
    const unsub = settings.onSharesChanged((newShares) => {
      setShares(newShares);
    });

    return unsub;
  }, [settings]);

  const addShare = React.useCallback((addr: string) => {
    return settings.addShare(addr);
  }, [settings]);

  const removeShare = React.useCallback((addr: string) => {
    return settings.removeShare(addr);
  }, [settings]);

  return [shares, addShare, removeShare];
}

export function useShareSecretSettings(): [
  Record<string, string>,
  (
    share: string,
    secret: string,
  ) => Promise<ValidationError | Record<string, string>>,
  (
    shareAddrOfSecretToRemove: string,
  ) => ValidationError | Record<string, string>,
] {
  const settings = React.useContext(SharedSettingsContext);

  const [secrets, setSecrets] = React.useState(() => settings.shareSecrets);

  React.useEffect(() => {
    const unsub = settings.onShareSecretsChanged((newSecrets) => {
      setSecrets(newSecrets);
    });

    return unsub;
  }, [settings]);

  const addSecret = React.useCallback(async (addr: string, secret: string) => {
    return settings.addSecret(addr, secret);
  }, [settings]);

  const removeSecret = React.useCallback((addr: string) => {
    return settings.removeSecret(addr);
  }, [settings]);

  return [secrets, addSecret, removeSecret];
}

export function useServerSettings(): [
  string[],
  (serverToAdd: string) => ValidationError | string[],
  (serverToRemove: string) => ValidationError | string[],
] {
  const settings = React.useContext(SharedSettingsContext);

  const [servers, setServers] = React.useState(() => settings.servers);

  React.useEffect(() => {
    const unsub = settings.onServersChanged((newServers) => {
      setServers(newServers);
    });

    return unsub;
  }, [settings]);

  const addServer = React.useCallback((url: string) => {
    return settings.addServer(url);
  }, [settings]);

  const removeServer = React.useCallback((url: string) => {
    return settings.removeServer(url);
  }, [settings]);

  return [servers, addServer, removeServer];
}

export function useReplica(
  replica: MultiformatReplica,
) {
  const cache = React.useMemo(
    () => {
      return new ReplicaCache(replica, 1000);
    },
    [replica],
  );

  const [version, setVersion] = React.useState(cache.version);

  React.useEffect(() => {
    setVersion(cache.version);

    return cache.onCacheUpdated(() => {
      setVersion(cache.version);
    });
  }, [cache]);

  const snapshot = React.useMemo(() => {
    return { cache, version };
  }, [version, cache]);

  const subscribe = (cb: () => void) => {
    return cache.onCacheUpdated(cb);
  };

  const obj = useSyncExternalStoreWithSelector(
    subscribe,
    () => snapshot,
    () => snapshot,
    (obj) => {
      return obj;
    },
  );

  return obj.cache;
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
