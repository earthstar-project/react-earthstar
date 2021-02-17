import * as React from 'react';
import { AuthorKeypair, IStorageAsync } from 'earthstar';
import LiveSyncer from './_LiveSyncer';
import {
  CurrentAuthorContext,
  CurrentWorkspaceContext,
  IsLiveContext,
  PubsContext,
  StorageContext,
} from '../contexts';
import FocusSyncer from './_FocusSyncer';

export default function EarthstarPeer({
  initWorkspaces = [],
  initPubs = {},
  initCurrentAuthor = null,
  initCurrentWorkspace = null,
  initIsLive = true,
  children,
}: {
  initWorkspaces?: IStorageAsync[];
  initPubs?: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair | null;
  initCurrentWorkspace?: string | null;
  initIsLive?: boolean;
  children: React.ReactNode;
}) {
  const [storages, setStorages] = React.useState(
    initWorkspaces.reduce<Record<string, IStorageAsync>>((acc, storage) => {
      return { ...acc, [storage.workspace]: storage };
    }, {})
  );

  const [pubs, setPubs] = React.useState(initPubs);

  const [currentAuthor, setCurrentAuthor] = React.useState(initCurrentAuthor);

  const [currentWorkspace, setCurrentWorkspace] = React.useState(
    initCurrentWorkspace && storages[initCurrentWorkspace]
      ? initCurrentWorkspace
      : null
  );
  const [isLive, setIsLive] = React.useState(initIsLive);

  return (
    <StorageContext.Provider value={{ storages, setStorages }}>
      <PubsContext.Provider value={{ pubs, setPubs }}>
        <CurrentAuthorContext.Provider
          value={{ currentAuthor, setCurrentAuthor }}
        >
          <CurrentWorkspaceContext.Provider
            value={{ currentWorkspace, setCurrentWorkspace }}
          >
            <IsLiveContext.Provider value={{ isLive, setIsLive }}>
              {children}
              {Object.keys(storages).map(workspaceAddress => (
                <LiveSyncer
                  key={workspaceAddress}
                  workspaceAddress={workspaceAddress}
                />
              ))}
              <FocusSyncer />
            </IsLiveContext.Provider>
          </CurrentWorkspaceContext.Provider>
        </CurrentAuthorContext.Provider>
      </PubsContext.Provider>
    </StorageContext.Provider>
  );
}
