import * as React from 'react';
import {
  PubEditor,
  RemoveWorkspaceButton,
  InvitationCreatorForm,
  SyncingCheckbox,
} from '..';
import { WhatIsAPub } from '../guidance/guidances';

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
        <h1>{'Pub Servers'}</h1>
        <PubEditor workspaceAddress={workspaceAddress} />
        <WhatIsAPub />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Invite People'}</h1>
        <p>
          {'Send this code to your friends so they can join the workspace.'}
        </p>
        <InvitationCreatorForm workspaceAddress={workspaceAddress} />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Danger Zone'}</h1>
        <p>
          You can remove your copy of the workspace from this device, but it
          will remain with pubs and other users it has synced with.
        </p>
        <p>
          It's not possible to globally delete a workspace, but you can delete
          your own data out of a workspace if the app allows it. If you do that,
          make sure to give your deletions time to sync with the pubs before you
          remove the entire workspace.
        </p>
        <RemoveWorkspaceButton
          workspaceAddress={workspaceAddress}
          onClick={onRemove}
        />
      </section>
    </div>
  );
}
