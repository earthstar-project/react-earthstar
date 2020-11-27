import React from 'react';
import { EarthbarTab, EarthbarTabLabel, EarthbarTabPanel } from '.';
import { InvitationRedemptionForm } from '..';

export default function AddWorkspaceTab() {
  return (
    <EarthbarTab data-react-earthstar-earthbar-workspace-add-tab>
      <EarthbarTabLabel>{'Add'}</EarthbarTabLabel>
      <EarthbarTabPanel>
        <h2>{'Join a workspace'}</h2>
        <InvitationRedemptionForm />
      </EarthbarTabPanel>
    </EarthbarTab>
  );
}
