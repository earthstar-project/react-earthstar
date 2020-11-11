import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';
import { CurrentWorkspaceSelect } from '..';
import { useCurrentWorkspace } from '../..';

export default function WorkspaceManager() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTabPanel data-react-earthstar-workspace-manager-panel>
      <CurrentWorkspaceSelect />
      <hr />
      {currentWorkspace ? (
        <WorkspaceOptions address={currentWorkspace} />
      ) : (
        'Select a workspace above to change that workspaces identity settings, pubs, and more.'
      )}
    </EarthbarTabPanel>
  );
}
