import * as React from "react";
import { ShareSecretsContext } from "../contexts";
import {
  useCurrentShare,
  useKeypair,
  usePeer,
  useReplicaServers,
} from "../hooks";
import { makeStorageKey } from "../util";

export function LocalStorageSettingsWriter({
  storageKey,
}: {
  storageKey: string;
}) {
  const lsAuthorKey = makeStorageKey(storageKey, "author");
  const lsServersKey = makeStorageKey(storageKey, "replica-servers");
  const lsSharesKey = makeStorageKey(storageKey, "shares");
  const lsCurrentShareKey = makeStorageKey(storageKey, "current-share");
  const lsShareSecretsKey = makeStorageKey(storageKey, "share-secrets");

  const peer = usePeer();

  const secrets = React.useContext(ShareSecretsContext)
  const [pubs] = useReplicaServers();
  const [currentIdentity] = useKeypair();
  const [currentShare] = useCurrentShare();

  React.useEffect(() => {
    return peer.onReplicasChange(() => {
      localStorage.setItem(lsSharesKey, JSON.stringify(peer.shares()));
    });
  }, [peer, lsSharesKey]);

  React.useEffect(() => {
    localStorage.setItem(lsServersKey, JSON.stringify(pubs));
  }, [pubs, lsServersKey]);

  React.useEffect(() => {
    localStorage.setItem(lsAuthorKey, JSON.stringify(currentIdentity));
  }, [currentIdentity, lsAuthorKey]);
  
  React.useEffect(() => {
    localStorage.setItem(lsShareSecretsKey, JSON.stringify(secrets));
  }, [secrets, lsShareSecretsKey]);

  React.useEffect(() => {
    console.log(currentShare)
    localStorage.setItem(
      lsCurrentShareKey,
      JSON.stringify(currentShare),
    );
  }, [currentShare, lsCurrentShareKey]);

  return null;
}
