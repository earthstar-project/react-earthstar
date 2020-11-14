import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import { useSync, WorkspaceLabel } from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';

export default function WorkspaceTab() {
  const [currentWorkspace] = useCurrentWorkspace();
  const sync = useSync();
  const [isSyncing, setIsSyncing] = React.useState(false);

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
          disabled={isSyncing}
          onClick={() => {
            setIsSyncing(true);
            sync(currentWorkspace)
              .then(() => {
                setIsSyncing(false);
              })
              // Sync doesn't reject yet, this won't fire
              .catch(() => {
                alert('Syncing current workspace failed!');
              });
          }}
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      ) : null}

      <WorkspaceManagerPanel />
    </EarthbarTab>
  );
}
