import React from 'react';
import {
  PubEditor,
  RemoveWorkspaceButton,
  InvitationCreatorForm,
  SyncingCheckbox,
} from '..';

export function WorkspaceOptions({
  workspaceAddress,
  onRemove,
}: {
  workspaceAddress?: string;
  onRemove?: () => void;
}) {
  return (
    <div data-re-earthbar-workspace-options>
      <section data-re-section>
        <SyncingCheckbox />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Pubs'}</h1>
        <p>{'Manage where this workspace syncs its data to and from.'}</p>
        <PubEditor workspaceAddress={workspaceAddress} />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Invite others'}</h1>
        <p>
          {'Generate invitation codes others can use to join this workspace.'}
        </p>
        <InvitationCreatorForm workspaceAddress={workspaceAddress} />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Danger Zone'}</h1>
        <p>
          {
            'Your local copy of the workspace will be removed, but will remain with other pubs and peers it has been synced to.'
          }
        </p>
        <RemoveWorkspaceButton onClick={onRemove} />
      </section>
    </div>
  );
}
