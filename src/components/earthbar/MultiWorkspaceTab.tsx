import React from 'react';
import MultiWorkspaceManagerPanel from './MultiWorkspaceManagerPanel';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';

export default function MultiWorkspaceTab() {
  return (
    <div data-re-earthbar-workspace-tab-zone>
      <EarthbarTab>
        <EarthbarTabLabel data-re-earthbar-author-tab>
          {'Workspaces'}
        </EarthbarTabLabel>
        <MultiWorkspaceManagerPanel />
      </EarthbarTab>
    </div>
  );
}
