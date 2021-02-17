import { AuthorKeypair, IStorageAsync } from 'earthstar';
import * as React from 'react';

export const StorageContext = React.createContext<{
  storages: Record<string, IStorageAsync>; // workspace address --> IStorage instance
  setStorages: React.Dispatch<
    React.SetStateAction<Record<string, IStorageAsync>>
  >;
}>({ storages: {}, setStorages: () => {} });

export const PubsContext = React.createContext<{
  pubs: Record<string, string[]>; // workspace address --> pub urls
  setPubs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}>({ pubs: {}, setPubs: () => {} });

export const CurrentAuthorContext = React.createContext<{
  currentAuthor: AuthorKeypair | null;
  setCurrentAuthor: React.Dispatch<React.SetStateAction<AuthorKeypair | null>>;
}>({ currentAuthor: null, setCurrentAuthor: () => {} });

export const CurrentWorkspaceContext = React.createContext<{
  currentWorkspace: null | string;
  setCurrentWorkspace: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
});

export const IsLiveContext = React.createContext<{
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isLive: true,
  setIsLive: () => {},
});
