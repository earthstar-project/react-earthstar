import { AuthorKeypair, Peer } from "earthstar";
import * as React from "react";

export const PeerContext = React.createContext<Peer>(new Peer());

export const ReplicaServersContext = React.createContext<{
  replicaServers: string[];
  setReplicaServers: React.Dispatch<React.SetStateAction<string[]>>;
}>({ replicaServers: [], setReplicaServers: () => [] });

export const KeypairContext = React.createContext<{
  keypair: AuthorKeypair | null;
  setKeypair: React.Dispatch<
    React.SetStateAction<AuthorKeypair | null>
  >;
}>({ keypair: null, setKeypair: () => {} });

export const CurrentShareContext = React.createContext<{
  currentShare: null | string;
  setCurrentShare: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  currentShare: null,
  setCurrentShare: () => {},
});

export const ShareSecretsContext = React.createContext<Record<string, string>>({})

export const AddShareContext = React.createContext<
  (shareAddress: string, secret?: string) => Promise<void>
>(async () => {});


