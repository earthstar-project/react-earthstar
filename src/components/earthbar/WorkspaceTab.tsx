import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import { useWorkspaces } from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';
import { getWorkspaceName } from '../../util';
import AddWorkspaceTab from './AddWorkspaceTab';

export default function WorkspaceTab() {
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();
  const workspaces = useWorkspaces();

  React.useEffect(() => {
    if (currentWorkspace === null && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  return (
    <div data-re-earthbar-workspace-tab-zone>
      <EarthbarTab data-re-earthbar-workspace-select-tab>
        {workspaces.length > 0 ? (
          <>
            <select
              value={currentWorkspace || 'NONE'}
              onChange={e => {
                setCurrentWorkspace(e.target.value);
              }}
            >
              {workspaces.map(address => (
                <option key={address} value={address}>
                  {`+${getWorkspaceName(address)}`}
                </option>
              ))}
            </select>
            <EarthbarTabLabel>{'Settings'}</EarthbarTabLabel>
            <WorkspaceManagerPanel />
          </>
        ) : (
          <span>{'Workspaces'}</span>
        )}
      </EarthbarTab>
      <AddWorkspaceTab />
    </div>
  );
}
