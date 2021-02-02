import * as React from 'react';
import WorkspaceLabel from '../WorkspaceLabel';
import SyncingCheckbox from '../SyncingCheckbox';
import InvitationRedemptionForm from '../InvitationRedemptionForm';
import WorkspaceCreatorForm from '../WorkspaceCreatorForm';
import { useWorkspaces } from '../../hooks';
import { WorkspaceOptions } from './WorkspaceOptions';
import { EarthbarContext } from './contexts';
import EarthbarTabPanel from './EarthbarTabPanel';

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
    <li data-re-workspace-row>
      <div data-re-workspace-item>
        <WorkspaceLabel data-re-workspace-row-address address={address} />
      </div>
      <button
        data-re-multiworkspace-settings-button
        data-re-button
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
        <h1>{'Your workspaces'}</h1>
        {workspaces.length > 0 ? (
          <>
            <SyncingCheckbox />
            <ul data-re-workspace-list-workspaces>
              {workspaces.map(address => (
                <WorkspaceRow
                  key={address}
                  navToWorkspace={() => navToWorkspace(address)}
                  address={address}
                />
              ))}
            </ul>
          </>
        ) : (
          <>
            <p>You have no workspaces saved to this device.</p>
            <p>
              If you have used Earthstar on another device, you will need to add
              your workspaces again to this device. The easiest way is to send
              yourself invitation codes.
            </p>
            <p>
              It's OK to use the same workspaces and author identity on multiple
              devices at the same time.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

export default function MultiWorkspaceManagerPanel() {
  const [state, dispatch] = React.useReducer(workspaceManagerReducer, {
    screen: 'list',
  });

  const { setFocusedIndex, setActiveIndex } = React.useContext(EarthbarContext);

  return (
    <EarthbarTabPanel>
      {state.screen === 'list' ? (
        <>
          <WorkspaceList
            navToWorkspace={address =>
              dispatch({ type: 'nav-workspace', address })
            }
          />
          <hr />
          <section>
            <h1>{'Join a workspace'}</h1>
            <InvitationRedemptionForm
              onRedeem={() => {
                setFocusedIndex(-1);
                setActiveIndex(-1);
              }}
            />
          </section>
          <hr />
          <section>
            <h1>{'Make a workspace'}</h1>
            <WorkspaceCreatorForm
              onCreate={() => {
                setActiveIndex(-1);
                setFocusedIndex(-1);
              }}
            />
          </section>
        </>
      ) : (
        <>
          <section>
            <nav data-re-workpace-options-header>
              <button
                data-re-button
                data-re-back-button
                onClick={() => dispatch({ type: 'nav-list' })}
              >
                {'Return to all workspaces'}
              </button>
              {state.address}
            </nav>
          </section>
          <hr />
          <WorkspaceOptions
            workspaceAddress={state.address}
            onRemove={() => {
              dispatch({ type: 'nav-list' });
            }}
          />
        </>
      )}
    </EarthbarTabPanel>
  );
}
