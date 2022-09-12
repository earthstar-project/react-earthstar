import * as React from "react";
import {
  useCurrentShare,
  useIdentity,
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

  const peer = usePeer();

  const [pubs] = useReplicaServers();
  const [currentIdentity] = useIdentity();
  const [currentShare] = useCurrentShare();

  React.useEffect(() => {
    return peer.onReplicasChange(() => {
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

  return null;
}
