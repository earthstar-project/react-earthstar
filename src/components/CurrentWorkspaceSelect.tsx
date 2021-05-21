import * as React from 'react';
import { useCurrentWorkspace, usePeer } from '../hooks';

export default function WorkspaceSelect() {
  const peer = usePeer();
  const workspaces = peer.workspaces();
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  const selectValue = currentWorkspace || 'NONE';

  return (
    <div data-re-current-workspace-select-form>
      <label
        data-re-current-workspace-select-label
        data-re-label
        htmlFor={'react-earthstar-current-workspace-select'}
      >
        {'Current Workspace'}
      </label>
      <select
        data-re-current-workspace-select-input
        data-re-select
        id={'react-earthstar-current-workspace-select'}
        value={selectValue}
        onChange={e =>
          setCurrentWorkspace(e.target.value === 'NONE' ? null : e.target.value)
        }
      >
        <option
          data-re-current-workspace-select-option
          key={'none'}
          value={'NONE'}
        >
          {'No workspace'}
        </option>
        {workspaces.map(address => (
          <option
            data-re-current-workspace-select-option
            key={address}
            value={address}
          >
            {address}
          </option>
        ))}
      </select>
    </div>
  );
}
