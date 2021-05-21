import * as React from 'react';
import { usePeer } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function WorkspaceChooser() {
  const peer = usePeer();
  const workspaces = peer.workspaces();

  return (
    <ul data-re-workspace-list>
      {workspaces.map(ws => (
        <li data-re-workspace-list-item key={ws}>
          <WorkspaceLabel address={ws} />
        </li>
      ))}
    </ul>
  );
}
