import React from 'react';
import MultiWorkspaceManagerPanel from './MultiWorkspaceManagerPanel';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';
import AddWorkspaceTab from './AddWorkspaceTab';

export default function MultiWorkspaceTab() {
  return (
    <>
      <EarthbarTab>
        <EarthbarTabLabel data-react-earthstar-earthbar-author-tab>
          {'Workspaces'}
        </EarthbarTabLabel>
        <MultiWorkspaceManagerPanel />
      </EarthbarTab>
      <AddWorkspaceTab />
    </>
  );
}
