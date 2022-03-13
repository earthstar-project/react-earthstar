import * as React from "react";
import { AuthorKeypair, Peer as EsPeer, Replica } from "earthstar";
import {
  AddShareContext,
  CurrentShareContext,
  IdentityContext,
  IsLiveContext,
  PeerContext,
  ReplicaServersContext,
} from "../contexts";
import { ReplicaSyncer } from "./_ReplicaSyncer";

export function Peer({
  initShares = [],
  initReplicaServers = [],
  initIdentity = null,
  initCurrentShare = null,
  initIsLive = true,
  onCreateShare,
  children,
}: {
  initShares?: string[];
  initReplicaServers?: string[];
  initIdentity?: AuthorKeypair | null;
  initCurrentShare?: string | null;
  initIsLive?: boolean;
  children: React.ReactNode;
  onCreateShare: (shareAddress: string) => Replica;
}) {
  const peer = React.useMemo(() => {
    const p = new EsPeer();

    initShares.forEach((shareAddress) => {
      p.addReplica(onCreateShare(shareAddress));
    });

    return p;
  }, []);

  const addShare = React.useCallback(async (shareAddress: string) => {
    try {
      const storage = onCreateShare(shareAddress);
      await peer.addReplica(storage);
    } catch (err) {
      console.error(err);

      return;
    }
  }, []);

  const [replicaServers, setReplicaServers] = React.useState(
    initReplicaServers,
  );

  const [identity, setIdentity] = React.useState(
    initIdentity,
  );

  const [currentShare, setCurrentShare] = React.useState<string | null>(
    initCurrentShare,
  );
  const [isLive, setIsLive] = React.useState(initIsLive);

  return (
    <PeerContext.Provider value={peer}>
      <ReplicaServersContext.Provider
        value={{ replicaServers, setReplicaServers }}
      >
        <IdentityContext.Provider
          value={{ identity, setIdentity }}
        >
          <CurrentShareContext.Provider
            value={{ currentShare, setCurrentShare }}
          >
            <IsLiveContext.Provider value={{ isLive, setIsLive }}>
              <AddShareContext.Provider value={addShare}>
                {children}
                {replicaServers.map((url) => (
                  <ReplicaSyncer key={url} pubUrl={url} />
                ))}
              </AddShareContext.Provider>
            </IsLiveContext.Provider>
          </CurrentShareContext.Provider>
        </IdentityContext.Provider>
      </ReplicaServersContext.Provider>
    </PeerContext.Provider>
  );
}
