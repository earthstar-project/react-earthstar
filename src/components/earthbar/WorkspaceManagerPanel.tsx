import React from 'react';
import { EarthbarContext, EarthbarTabPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';

export default function WorkspaceManagerPanel() {
  const { setActiveIndex, setFocusedIndex } = React.useContext(EarthbarContext);

  return (
    <EarthbarTabPanel data-re-workspace-manager-panel>
      <WorkspaceOptions
        onRemove={() => {
          setActiveIndex(-1);
          setFocusedIndex(-1);
        }}
      />
    </EarthbarTabPanel>
  );
}
