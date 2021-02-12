import * as React from 'react';
import { useCurrentWorkspace } from '../../hooks';
import { EarthbarContext } from './contexts';
import EarthbarTabPanel from './EarthbarTabPanel';
import { WorkspaceOptions } from './WorkspaceOptions';

export default function WorkspaceManagerPanel() {
  const { setActiveIndex, setFocusedIndex } = React.useContext(EarthbarContext);
  const [currentWorkspace] = useCurrentWorkspace();

  return currentWorkspace ? (
    <EarthbarTabPanel data-re-workspace-manager-panel>
      <WorkspaceOptions
        workspaceAddress={currentWorkspace}
        onRemove={() => {
          setActiveIndex(-1);
          setFocusedIndex(-1);
        }}
      />
    </EarthbarTabPanel>
  ) : null;
}
