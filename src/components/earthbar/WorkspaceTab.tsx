import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import { WorkspaceLabel } from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarButton, EarthbarTab } from './Earthbar';

export default function AuthorTab() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTab>
      <EarthbarButton data-react-earthstar-earthbar-author-tab>
        {currentWorkspace ? (
          <WorkspaceLabel address={currentWorkspace} />
        ) : (
          'Workspace'
        )}
      </EarthbarButton>
      <WorkspaceManagerPanel />
    </EarthbarTab>
  );
}
