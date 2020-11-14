import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import { useSync, WorkspaceLabel } from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';

type SyncStatus = 'syncing' | 'synced' | 'idle';

export default function WorkspaceTab() {
  const [currentWorkspace] = useCurrentWorkspace();
  const sync = useSync();

  const [syncState, setSyncState] = React.useState<SyncStatus>('idle');

  React.useEffect(() => {
    let id = setTimeout(() => {
      if (syncState === 'synced') {
        setSyncState('idle');
      }
    }, 2000);
    return () => clearTimeout(id);
  }, [syncState]);

  return (
    <EarthbarTab>
      <EarthbarTabLabel data-react-earthstar-earthbar-author-tab>
        {currentWorkspace ? (
          <WorkspaceLabel address={currentWorkspace} />
        ) : (
          'Workspace'
        )}
      </EarthbarTabLabel>
      {currentWorkspace ? (
        <button
          data-react-earthstar-button
          disabled={syncState === 'syncing'}
          onClick={() => {
            setSyncState('syncing');
            sync(currentWorkspace)
              .then(() => {
                setSyncState('synced');
              })
              // Sync doesn't reject yet, this won't fire
              .catch(() => {
                setSyncState('idle');
                alert('Syncing current workspace failed!');
              });
          }}
        >
          {syncState === 'syncing'
            ? 'Syncing...'
            : syncState === 'synced'
            ? 'Synced!'
            : 'Sync'}
        </button>
      ) : null}

      <WorkspaceManagerPanel />
    </EarthbarTab>
  );
}
