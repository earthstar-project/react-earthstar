import React from 'react';
import { WorkspaceOptions } from './WorkspaceOptions';
import { CurrentWorkspaceSelect } from '..';
import { useCurrentWorkspace } from '../..';

export default function WorkspaceManager() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <div>
      <CurrentWorkspaceSelect />
      <hr />
      {currentWorkspace ? (
        <WorkspaceOptions address={currentWorkspace} />
      ) : (
        'Select a workspace above to change that workspaces identity settings, pubs, and more.'
      )}
    </div>
  );
}
