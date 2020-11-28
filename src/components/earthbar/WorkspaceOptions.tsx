import React from 'react';
import { PubEditor, RemoveWorkspaceButton, InvitationCreatorForm } from '..';

export function WorkspaceOptions({ address }: { address: string }) {
  return (
    <div data-react-earthstar-earthbar-workspace-options>
      <details data-react-earthstar-details>
        <summary data-react-earthstar-summary>{'Pubs'}</summary>
        <p>{'Control where this workspace syncs its data to and from.'}</p>
        <PubEditor workspace={address} />
      </details>
      <hr />
      <details data-react-earthstar-details>
        <summary data-react-earthstar-summary>{'Invite others'}</summary>
        <InvitationCreatorForm workspace={address} />
      </details>
      <hr />
      <details data-react-earthstar-details>
        <summary data-react-earthstar-summary>{'Danger Zone'}</summary>
        <p>
          {
            'Your local copy of the workspace will be removed, but will remain with other pubs and peers it has been synced to.'
          }
        </p>
        <RemoveWorkspaceButton workspaceAddress={address} />
      </details>
    </div>
  );
}
