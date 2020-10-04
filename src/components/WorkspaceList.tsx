import React from 'react';

import { useWorkspaces } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function WorkspaceChooser() {
  const workspaces = useWorkspaces();

  return <ul>
    {workspaces.map(ws =>
      <li key={ws}>
        <WorkspaceLabel address={ws} />
      </li>
    )}
  </ul>; 
}
