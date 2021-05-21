import * as React from 'react';
import { AuthorKeypair, StorageAsync, Peer } from 'stone-soup';
import {
  PeerContext,
  CurrentAuthorContext,
  CurrentWorkspaceContext,
  IsLiveContext,
  PubsContext,
  AddWorkspaceContext,
} from '../contexts';
import FocusSyncer from './_FocusSyncer';

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
  const [peer, setPeer] = React.useState(() => new Peer());

  React.useEffect(() => {
    const unsub = peer.storageMap.bus.on('*', () => {
      setPeer(peer);
    });

    return () => {
      unsub();
    };
  }, [peer]);

  const addWorkspace = React.useCallback((workspaceAddress: string) => {
    const storage = onCreateWorkspace(workspaceAddress);

    peer.addStorage(storage);
  }, []);

  React.useEffect(() => {
    initWorkspaces.forEach(workspaceAddress => {
      peer.addStorage(onCreateWorkspace(workspaceAddress));
    });
  }, []);

  const [pubs, setPubs] = React.useState(initPubs);

  const [currentAuthor, setCurrentAuthor] = React.useState(initCurrentAuthor);

  const [currentWorkspace, setCurrentWorkspace] = React.useState(
    initCurrentWorkspace && peer.getStorage(initCurrentWorkspace)
      ? initCurrentWorkspace
      : null
  );
  const [isLive, setIsLive] = React.useState(initIsLive);

  return (
    <PeerContext.Provider value={peer}>
      <PubsContext.Provider value={{ pubs, setPubs }}>
        <CurrentAuthorContext.Provider
          value={{ currentAuthor, setCurrentAuthor }}
        >
          <CurrentWorkspaceContext.Provider
            value={{ currentWorkspace, setCurrentWorkspace }}
          >
            <IsLiveContext.Provider value={{ isLive, setIsLive }}>
              <AddWorkspaceContext.Provider value={addWorkspace}>
                {children}

                <FocusSyncer />
              </AddWorkspaceContext.Provider>
            </IsLiveContext.Provider>
          </CurrentWorkspaceContext.Provider>
        </CurrentAuthorContext.Provider>
      </PubsContext.Provider>
    </PeerContext.Provider>
  );
}
