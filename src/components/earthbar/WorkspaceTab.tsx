import * as React from 'react';
import WorkspaceManagerPanel from './WorkspaceManagerPanel';
import InvitationRedemptionForm from '../InvitationRedemptionForm';
import WorkspaceCreatorForm from '../WorkspaceCreatorForm';
import EarthbarTab from './EarthbarTab';
import EarthbarTabLabel from './EarthbarTabLabel';
import EarthbarTabPanel from './EarthbarTabPanel';
import { useCurrentWorkspace, useWorkspaces } from '../../hooks';
import { getWorkspaceName } from '../../util';
import { usePrevious } from '@reach/utils';
import { EarthbarContext } from './contexts';

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

  const { setFocusedIndex, setActiveIndex } = React.useContext(EarthbarContext);

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
                <InvitationRedemptionForm
                  onRedeem={() => {
                    setFocusedIndex(-1);
                    setActiveIndex(-1);
                  }}
                />
              </section>
            </EarthbarTabPanel>
          </EarthbarTab>
          <EarthbarTab>
            <EarthbarTabLabel>{'Create'}</EarthbarTabLabel>
            <EarthbarTabPanel>
              <section data-re-section>
                <h1>{'Create a new workspace'}</h1>
                <WorkspaceCreatorForm
                  onCreate={() => {
                    setFocusedIndex(-1);
                    setActiveIndex(-1);
                  }}
                />
              </section>
            </EarthbarTabPanel>
          </EarthbarTab>
        </>
      )}
    </div>
  );
}
