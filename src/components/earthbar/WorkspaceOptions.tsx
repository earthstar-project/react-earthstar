import React from 'react';
import {
  PubEditor,
  DisplayNameForm,
  RemoveWorkspaceButton,
  InvitationCreatorForm,
} from '..';

export function WorkspaceOptions({ address }: { address: string }) {
  return (
    <div>
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
        <h2>{'Invite others'}</h2>
        <InvitationCreatorForm workspace={address} />
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
