import React from 'react';

import { useWorkspaces } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function WorkspaceChooser() {
  const workspaces = useWorkspaces();

  return (
    <ul data-react-earthstar-workspace-list>
      {workspaces.map(ws => (
        <li data-react-earthstar-workspace-list-item key={ws}>
          <WorkspaceLabel address={ws} />
        </li>
      ))}
    </ul>
  );
}
