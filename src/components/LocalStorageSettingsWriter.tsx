import * as React from "react";
import {
  useCurrentShare,
  useIdentity,
  useIsLive,
  usePeer,
  useReplicaServers,
} from "../hooks";
import { makeStorageKey } from "../util";

export function LocalStorageSettingsWriter({
  storageKey,
}: {
  storageKey: string;
}) {
  const lsIdentityKey = makeStorageKey(storageKey, "identity");
  const lsPubsKey = makeStorageKey(storageKey, "replica-servers");
  const lsSharesKey = makeStorageKey(storageKey, "shares");
  const lsCurrentShareKey = makeStorageKey(storageKey, "current-share");
  const lsIsLiveKey = makeStorageKey(storageKey, "is-live");

  const peer = usePeer();

  const [pubs] = useReplicaServers();
  const [currentIdentity] = useIdentity();
  const [currentShare] = useCurrentShare();
  const [isLive] = useIsLive();

  React.useEffect(() => {
    return peer.replicaMap.bus.on("*", () => {
      console.log("writing shares...");
      localStorage.setItem(lsSharesKey, JSON.stringify(peer.shares()));
    });
  }, [peer, lsSharesKey]);

  React.useEffect(() => {
    localStorage.setItem(lsPubsKey, JSON.stringify(pubs));
  }, [pubs, lsPubsKey]);

  React.useEffect(() => {
    localStorage.setItem(lsIdentityKey, JSON.stringify(currentIdentity));
  }, [currentIdentity, lsIdentityKey]);

  React.useEffect(() => {
    localStorage.setItem(
      lsCurrentShareKey,
      JSON.stringify(currentShare),
    );
  }, [currentShare, lsCurrentShareKey]);

  React.useEffect(() => {
    localStorage.setItem(lsIsLiveKey, JSON.stringify(isLive));
  });

  return null;
}
