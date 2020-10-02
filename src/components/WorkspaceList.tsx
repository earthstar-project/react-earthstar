import React from 'react';

import { useWorkspaces } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function WorkspaceChooser() {
  const workspaces = useWorkspaces();

  return <div>
    {workspaces.map(ws =>
      <div key={ws}>
        <WorkspaceLabel address={ws} />
      </div>
    )}
  </div>; 
}
