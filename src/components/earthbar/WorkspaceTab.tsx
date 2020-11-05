import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import { WorkspaceLabel } from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';

export default function AuthorTab() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTab>
      <EarthbarTabLabel data-react-earthstar-earthbar-author-tab>
        {currentWorkspace ? (
          <WorkspaceLabel address={currentWorkspace} />
        ) : (
          'Workspace'
        )}
      </EarthbarTabLabel>
      <WorkspaceManagerPanel />
    </EarthbarTab>
  );
}
