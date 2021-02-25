import * as React from 'react';
import MultiWorkspaceManagerPanel from './MultiWorkspaceManagerPanel';
import EarthbarTab from './EarthbarTab';
import EarthbarTabLabel from './EarthbarTabLabel';
import { useCurrentWorkspace } from '../../hooks';

export default function MultiWorkspaceTab() {
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  // When in use, ensure that currentWorkspace is always null
  React.useEffect(() => {
    if (currentWorkspace) {
      setCurrentWorkspace(null);
    }
  }, [currentWorkspace, setCurrentWorkspace]);

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
