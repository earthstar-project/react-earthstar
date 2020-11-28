import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';
import { InvitationRedemptionForm, SyncingCheckbox } from '..';
import { useCurrentWorkspace } from '../..';

export default function WorkspaceManager() {
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTabPanel data-react-earthstar-workspace-manager-panel>
      {currentWorkspace ? (
        <>
          <h2>{currentWorkspace}</h2>
          <SyncingCheckbox />
          <hr />
          <WorkspaceOptions address={currentWorkspace} />
        </>
      ) : (
        <>
          <h2>{'Join a workspace'}</h2>
          <InvitationRedemptionForm
            onRedeem={workspace => {
              console.log(workspace);
              setTimeout(() => {
                setCurrentWorkspace(workspace);
              });
            }}
          />
        </>
      )}
    </EarthbarTabPanel>
  );
}
