import * as React from 'react';
import { AuthorKeypair, StorageAsync } from 'stone-soup';
import LiveSyncer from './_LiveSyncer';
import {
  CurrentAuthorContext,
  CurrentWorkspaceContext,
  IsLiveContext,
  PubsContext,
  StorageContext,
} from '../contexts';
import FocusSyncer from './_FocusSyncer';
import { usePrevious } from '@reach/utils';

export default function EarthstarPeer({
  initWorkspaces = [],
  initPubs = {},
  initCurrentAuthor = null,
  initCurrentWorkspace = null,
  initIsLive = true,
  onCreateWorkspace,
  children,
}: {
  initWorkspaces?: string[];
  initPubs?: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair | null;
  initCurrentWorkspace?: string | null;
  initIsLive?: boolean;
  children: React.ReactNode;
  onCreateWorkspace: (workspaceAddress: string) => StorageAsync;
}) {
  const [storages, setStorages] = React.useState(
    initWorkspaces.reduce((acc, workspaceAddress) => {
      return {
        ...acc,
        [workspaceAddress]: onCreateWorkspace(workspaceAddress),
      };
    }, {} as Record<string, StorageAsync>)
  );

  const addStorage = React.useCallback(
    (workspaceAddress: string) => {
      const storage = onCreateWorkspace(workspaceAddress);

      setStorages(prev => ({
        ...prev,
        [workspaceAddress]: storage,
      }));
    },
    [onCreateWorkspace]
  );

  const [pubs, setPubs] = React.useState(initPubs);

  const [currentAuthor, setCurrentAuthor] = React.useState(initCurrentAuthor);

  const [currentWorkspace, setCurrentWorkspace] = React.useState(
    initCurrentWorkspace && storages[initCurrentWorkspace]
      ? initCurrentWorkspace
      : null
  );
  const [isLive, setIsLive] = React.useState(initIsLive);

  const prevStorages = usePrevious(storages);

  // Close any workspace storages which have been removed from storages
  React.useEffect(() => {
    const storagesSet = new Set(Object.values(storages));

    const difference = Array.from(Object.values(prevStorages || [])).filter(
      storage => !storagesSet.has(storage)
    );

    difference.forEach(
      storage => {
        storage.close();
      },
      [storages, prevStorages]
    );
  }, [storages, prevStorages]);

  return (
    <StorageContext.Provider value={{ storages, setStorages, addStorage }}>
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
