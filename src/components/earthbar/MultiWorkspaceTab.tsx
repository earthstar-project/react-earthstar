import * as React from 'react';
import MultiWorkspaceManagerPanel from './MultiWorkspaceManagerPanel';
import EarthbarTab from './EarthbarTab';
import EarthbarTabLabel from './EarthbarTabLabel';

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
