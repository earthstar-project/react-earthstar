import React from 'react';
import { EarthbarPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';
import { CurrentWorkspaceSelect } from '..';
import { useCurrentWorkspace } from '../..';

export default function WorkspaceManager() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarPanel data-react-earthstar-workspace-manager-panel>
      <CurrentWorkspaceSelect />
      <hr />
      {currentWorkspace ? (
        <WorkspaceOptions address={currentWorkspace} />
      ) : (
        'Select a workspace above to change that workspaces identity settings, pubs, and more.'
      )}
    </EarthbarPanel>
  );
}
