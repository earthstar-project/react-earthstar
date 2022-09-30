import * as React from "react";
import { AuthorKeypair, Peer as EsPeer, Replica } from "earthstar";
import {
  AddShareContext,
  ShareSecretsContext,
  CurrentShareContext,
  KeypairContext,
  PeerContext,
  ReplicaServersContext,
} from "../contexts";

export function Peer({
  initShares = [],
  initShareSecrets = {},
  initReplicaServers = [],
  initIdentity = null,
  initCurrentShare = null,
  onCreateShare,
  children,
}: {
  initShares?: string[];
  initShareSecrets?: Record<string, string>;
  initReplicaServers?: string[];
  initIdentity?: AuthorKeypair | null;
  initCurrentShare?: string | null;
  initIsLive?: boolean;
  children: React.ReactNode;
  onCreateShare: (shareAddress: string, secret?: string) => Replica;
}) {
  const peer = React.useMemo(() => {
    const p = new EsPeer();
    
    console.log(initShares, initShareSecrets)

    initShares.forEach((address) => {
      p.addReplica(onCreateShare(address, initShareSecrets[address]));
    });

    return p;
  }, []);
  
  const [secrets, setSecrets] = React.useState(initShareSecrets)

  const [replicaServers, setReplicaServers] = React.useState(
    initReplicaServers,
  );

  const [keypair, setKeypair] = React.useState(
    initIdentity,
  );

  const [currentShare, setCurrentShare] = React.useState<string | null>(
    initCurrentShare,
  );
  
  const addShare = React.useCallback(async (shareAddress: string, secret?: string) => {
    try {
      const storage = onCreateShare(shareAddress);
      await peer.addReplica(storage);
      
      if (secret) {
        setSecrets((prev) => ({...prev, 
          
          [shareAddress]: secret
        }))  
      }
      
      
    } catch (err) {
      console.error(err);
  
      return;
    }
  }, []);
  
  React.useEffect(() => {
    peer.onReplicasChange((replicas) => {
      const addresses = new Set(replicas.keys())
      
      setSecrets((prev) => {
        const next: Record<string, string> = {}
        
        for (const key in prev) {
          if (addresses.has(key)) {
            next[key] = prev[key]
          }
        }
        
        return prev;
      })
    })
  })


  return (
    <PeerContext.Provider value={peer}>
      <ShareSecretsContext.Provider
      value={secrets}
      >
      <ReplicaServersContext.Provider
        value={{ replicaServers, setReplicaServers }}
      >
        <KeypairContext.Provider
          value={{ keypair, setKeypair }}
        >
          <CurrentShareContext.Provider
            value={{ currentShare, setCurrentShare }}
          >
          <AddShareContext.Provider value={addShare}>

              {children}   
              </AddShareContext.Provider>

          </CurrentShareContext.Provider>
        </KeypairContext.Provider>
      </ReplicaServersContext.Provider>
      </ShareSecretsContext.Provider>
    </PeerContext.Provider>
  );
}
