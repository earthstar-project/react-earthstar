import React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import {
  InvitationRedemptionForm,
  useWorkspaces,
  WorkspaceCreatorForm,
} from '../..';
import { useCurrentWorkspace } from '../../index';
import { EarthbarTabLabel, EarthbarTab, EarthbarTabPanel } from './Earthbar';
import { getWorkspaceName } from '../../util';
import { usePrevious } from '@reach/utils';

export default function WorkspaceTab() {
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();
  const [selectedOption, setSelectedOption] = React.useState(
    currentWorkspace || 'ADD_WORKSPACE'
  );
  const workspaces = useWorkspaces();

  const previousWorkspace = usePrevious(currentWorkspace);

  // This effect will change the selected option to match the current workspace when it changes
  React.useEffect(() => {
    if (currentWorkspace && previousWorkspace !== currentWorkspace) {
      setSelectedOption(currentWorkspace);
    }
  }, [currentWorkspace, previousWorkspace]);

  return (
    <div data-re-earthbar-workspace-tab-zone>
      <select
        value={selectedOption}
        onChange={e => {
          const option = e.target.value;

          setSelectedOption(option);

          if (option !== 'ADD_WORKSPACE') {
            setCurrentWorkspace(option);
          }
        }}
      >
        {workspaces.map(address => (
          <option key={address} value={address}>
            {`+${getWorkspaceName(address)}`}
          </option>
        ))}
        <option key={'add'} value={'ADD_WORKSPACE'}>
          {'Add workspace'}
        </option>
      </select>
      {selectedOption !== 'ADD_WORKSPACE' ? (
        <EarthbarTab data-re-earthbar-workspace-select-tab>
          <EarthbarTabLabel>{'Workspace settings'}</EarthbarTabLabel>
          <WorkspaceManagerPanel />
        </EarthbarTab>
      ) : (
        <>
          <EarthbarTab>
            <EarthbarTabLabel>{'Join'}</EarthbarTabLabel>
            <EarthbarTabPanel>
              <section data-re-section>
                <h1>{'Join a workspace'}</h1>
                <InvitationRedemptionForm />
              </section>
            </EarthbarTabPanel>
          </EarthbarTab>
          <EarthbarTab>
            <EarthbarTabLabel>{'Create'}</EarthbarTabLabel>
            <EarthbarTabPanel>
              <section data-re-section>
                <h1>{'Create a new workspace'}</h1>
                <WorkspaceCreatorForm />
              </section>
            </EarthbarTabPanel>
          </EarthbarTab>
        </>
      )}
    </div>
  );
}
