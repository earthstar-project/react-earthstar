import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import { WorkspaceLabel, SyncingCheckbox } from '..';
import { useWorkspaces } from '../..';
import { WorkspaceOptions } from './WorkspaceOptions';

type WorkspaceManagerState =
  | { screen: 'list' }
  | { screen: 'workspace'; address: string };
type WorkspaceManagerAction =
  | { type: 'nav-list' }
  | { type: 'nav-workspace'; address: string };

function workspaceManagerReducer(
  state: WorkspaceManagerState,
  action: WorkspaceManagerAction
): WorkspaceManagerState {
  switch (action.type) {
    case 'nav-list':
      return { screen: 'list' };
    case 'nav-workspace':
      return { screen: 'workspace', address: action.address };
    default:
      return state;
  }
}

function WorkspaceRow({
  address,
  navToWorkspace,
}: {
  address: string;
  navToWorkspace: () => void;
}) {
  return (
    <li data-react-earthstar-workspace-row>
      <div>
        <WorkspaceLabel
          data-react-earthstar-workspace-row-address
          address={address}
        />
      </div>
      <button
        data-react-earthstar-multiworkspace-settings-button
        data-react-earthstar-button
        onClick={navToWorkspace}
      >
        {'Settings'}
      </button>
    </li>
  );
}

function WorkspaceList({
  navToWorkspace,
}: {
  navToWorkspace: (address: string) => void;
}) {
  const workspaces = useWorkspaces();

  return (
    <div>
      <section>
        <h2>{'Your workspaces'}</h2>
        <SyncingCheckbox />
        <ul data-react-earthstar-workspace-list-workspaces>
          {workspaces.map(address => (
            <WorkspaceRow
              key={address}
              navToWorkspace={() => navToWorkspace(address)}
              address={address}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function MultiWorkspaceManagerPanel() {
  const [state, dispatch] = React.useReducer(workspaceManagerReducer, {
    screen: 'list',
  });

  return (
    <EarthbarTabPanel>
      {state.screen === 'list' ? (
        <WorkspaceList
          navToWorkspace={address =>
            dispatch({ type: 'nav-workspace', address })
          }
        />
      ) : (
        <div>
          <nav data-react-earthstar-workpace-options-header>
            <button
              data-react-earthstar-button
              onClick={() => dispatch({ type: 'nav-list' })}
            >
              {'← Back'}
            </button>
            {state.address}
          </nav>
          <hr />
          <WorkspaceOptions workspaceAddress={state.address} />
        </div>
      )}
    </EarthbarTabPanel>
  );
}
