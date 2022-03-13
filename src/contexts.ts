import { AuthorKeypair, Peer } from "earthstar";
import * as React from "react";

export const PeerContext = React.createContext<Peer>(new Peer());

export const ReplicaServersContext = React.createContext<{
  replicaServers: string[];
  setReplicaServers: React.Dispatch<React.SetStateAction<string[]>>;
}>({ replicaServers: [], setReplicaServers: () => [] });

export const IdentityContext = React.createContext<{
  identity: AuthorKeypair | null;
  setIdentity: React.Dispatch<
    React.SetStateAction<AuthorKeypair | null>
  >;
}>({ identity: null, setIdentity: () => { } });

export const CurrentShareContext = React.createContext<{
  currentShare: null | string;
  setCurrentShare: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  currentShare: null,
  setCurrentShare: () => { },
});

export const IsLiveContext = React.createContext<{
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isLive: true,
  setIsLive: () => { },
});

export const AddShareContext = React.createContext<
  (shareAddress: string) => Promise<void>
>(async () => { });
