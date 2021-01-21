import React from 'react';
import {
  EarthbarContext,
  EarthbarTab,
  EarthbarTabLabel,
  EarthbarTabPanel,
} from '.';
import { useCurrentWorkspace } from '../../hooks';
import InvitationRedemptionForm from '../InvitationRedemptionForm';
import WorkspaceCreatorForm from '../WorkspaceCreatorForm';

export default function AddWorkspaceTab() {
  const { setActiveIndex } = React.useContext(EarthbarContext);
  const [, setCurrentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTab data-re-earthbar-workspace-add-tab>
      <EarthbarTabLabel>{'Add'}</EarthbarTabLabel>
      <EarthbarTabPanel>
        <h2>{'Join a workspace'}</h2>
        <InvitationRedemptionForm
          onRedeem={workspace => {
            setActiveIndex(-1);
            setCurrentWorkspace(workspace);
          }}
        />
        <hr />
        <h2>{'Make a workspace'}</h2>
        <WorkspaceCreatorForm
          onCreate={workspace => {
            setActiveIndex(-1);
            setCurrentWorkspace(workspace);
          }}
        />
      </EarthbarTabPanel>
    </EarthbarTab>
  );
}
