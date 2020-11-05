import React from 'react';
import { useCurrentWorkspace, useWorkspaces } from '../';

export default function WorkspaceSelect() {
  const workspaces = useWorkspaces();
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  const selectValue = currentWorkspace || 'NONE';

  return (
    <div data-react-earthstar-current-workspace-select-form>
      <label
        data-react-earthstar-current-workspace-select-label
        htmlFor={'react-earthstar-current-workspace-select'}
      >
        {'Current Workspace'}
      </label>
      <select
        data-react-earthstar-current-workspace-select-input
        id={'react-earthstar-current-workspace-select'}
        value={selectValue}
        onChange={e =>
          setCurrentWorkspace(e.target.value === 'NONE' ? null : e.target.value)
        }
      >
        <option
          data-react-earthstar-current-workspace-select-option
          key={'none'}
          value={'NONE'}
        >
          {'No workspace'}
        </option>

        {workspaces.map(address => (
          <option
            data-react-earthstar-current-workspace-select-option
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
