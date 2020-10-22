import React from 'react';
import {
  AddWorkspaceForm,
  WorkspaceLabel,
  PubEditor,
  DisplayNameForm,
  RemoveWorkspaceButton,
} from '..';
import { useWorkspaces, useSync } from '../..';

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
  const sync = useSync();

  return (
    <li data-react-earthstar-workspace-row>
      <div>
        <WorkspaceLabel
          data-react-earthstar-workspace-row-address
          address={address}
        />
        <button onClick={navToWorkspace}>{'Settings'}</button>
      </div>
      {/* TODO: Replace this with a checkbox which toggles live syncing individually */}
      <button
        data-react-earthstar-workspace-row-sync
        onClick={() => sync(address)}
      >
        {'Sync'}
      </button>
    </li>
  );
}

function WorkspaceOptions({
  onBack,
  address,
}: {
  onBack: () => void;
  address: string;
}) {
  return (
    <div>
      <nav data-react-earthstar-workpace-options-header>
        <button onClick={onBack}>{'← Back'}</button>
        <WorkspaceLabel address={address} />
      </nav>
      <hr />
      <section>
        <h2>{'Identity Settings'}</h2>
        <p>{'Choose how to represent yourself on this workspace.'}</p>
        <DisplayNameForm workspace={address} />
      </section>
      <hr />
      <section>
        <h2>{'Pubs'}</h2>
        <p>{'Control where this workspace syncs its data to and from.'}</p>
        <PubEditor workspace={address} />
      </section>
      <hr />
      <section>
        <h2>{'Danger Zone'}</h2>
        <p>
          {
            'Your local copy of the workspace will be removed, but will remain with other pubs and peers it has been synced to.'
          }
        </p>
        <RemoveWorkspaceButton workspaceAddress={address} />
      </section>
    </div>
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
        {/* TODO: Add syncing checkbox to the right of title */}
        {/* Which toggles live syncing for all workspaces*/}
        <ul data-react-earthstar-workspace-list-workspaces>
          {workspaces.map(address => (
            <WorkspaceRow
              navToWorkspace={() => navToWorkspace(address)}
              address={address}
            />
          ))}
        </ul>
      </section>
      <hr />
      <section>
        <h2>{'Add a workspace'}</h2>
        <AddWorkspaceForm />
      </section>
    </div>
  );
}

export default function WorkspaceManager() {
  const [state, dispatch] = React.useReducer(workspaceManagerReducer, {
    screen: 'list',
  });

  return state.screen === 'list' ? (
    <WorkspaceList
      navToWorkspace={address => dispatch({ type: 'nav-workspace', address })}
    />
  ) : (
    <WorkspaceOptions
      address={state.address}
      onBack={() => dispatch({ type: 'nav-list' })}
    />
  );
}
