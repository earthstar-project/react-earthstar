import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import { WorkspaceOptions } from './WorkspaceOptions';
import { CurrentWorkspaceSelect, InvitationRedemptionForm } from '..';
import { useCurrentWorkspace } from '../..';

export default function WorkspaceManager() {
  const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTabPanel data-react-earthstar-workspace-manager-panel>
      <CurrentWorkspaceSelect />
      <hr />
      {currentWorkspace ? (
        <WorkspaceOptions address={currentWorkspace} />
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
