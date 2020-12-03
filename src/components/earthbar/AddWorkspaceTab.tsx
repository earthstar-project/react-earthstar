import React from 'react';
import { EarthbarTab, EarthbarTabLabel, EarthbarTabPanel } from '.';
import InvitationRedemptionForm from '../InvitationRedemptionForm';
import WorkspaceCreatorForm from '../WorkspaceCreatorForm';

export default function AddWorkspaceTab() {
  return (
    <EarthbarTab data-react-earthstar-earthbar-workspace-add-tab>
      <EarthbarTabLabel>{'Add'}</EarthbarTabLabel>
      <EarthbarTabPanel>
        <h2>{'Join a workspace'}</h2>
        <InvitationRedemptionForm />
        <hr />
        <h2>{'Make a workspace'}</h2>
        <WorkspaceCreatorForm />
      </EarthbarTabPanel>
    </EarthbarTab>
  );
}
