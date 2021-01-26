import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';

export default function WorkspaceManagerPanel() {
  return (
    <EarthbarTabPanel data-re-workspace-manager-panel>
      <WorkspaceOptions />
    </EarthbarTabPanel>
  );
}
