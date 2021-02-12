import * as React from 'react';
import {
  PubEditor,
  RemoveWorkspaceButton,
  InvitationCreatorForm,
  SyncingCheckbox,
  DeleteMyDataForm,
} from '..';

export function WorkspaceOptions({
  workspaceAddress,
  onRemove,
}: {
  workspaceAddress: string;
  onRemove?: () => void;
}) {
  const [isDangerZoneShown, setIsDangerZoneShown] = React.useState(false);

  return (
    <div data-re-earthbar-workspace-options>
      <section data-re-section>
        <SyncingCheckbox />
      </section>
      <hr />
      <section data-re-section>
        <h1>{'Pub Servers'}</h1>
        <p>{'Servers that help this workspace sync its data.'}</p>
        <PubEditor workspaceAddress={workspaceAddress} />
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
      {isDangerZoneShown ? (
        <>
          <section data-re-section>
            <h1>{'Forget this workspace'}</h1>
            <RemoveWorkspaceButton
              workspaceAddress={workspaceAddress}
              onClick={onRemove}
            />
            <details data-re-details>
              <summary data-re-summary>
                {'Will this remove the workspace everywhere?'}
              </summary>
              <div data-re-details-content>
                <p>
                  {
                    'This button will remove your copy of the workspace from this app, but it will remain with apps, pubs, and other users it has synced with.'
                  }
                </p>
                <p>
                  {
                    "It's not possible to globally delete a workspace, but you can delete your own data out of a workspace."
                  }
                </p>
              </div>
            </details>
          </section>
          <hr />
          <section data-re-section>
            <h1>{'Delete my data'}</h1>
            <DeleteMyDataForm workspaceAddress={workspaceAddress} />
            <details data-re-details>
              <summary data-re-summary>
                {'What will deleting my data do?'}
              </summary>
              <div data-re-details-content>
                <p>
                  {
                    'Deleting your data will overwrite all the documents you created with empty strings, which is the usual way to "delete" things from Earthstar. These deletions will propagate across the network, erasing your content from everyone in the workspace the next time they sync.'
                  }
                </p>
                <p>
                  {
                    'Metadata about your documents will be left behind, including their timestamps and their paths (e.g. filenames). Only the content will be deleted.'
                  }
                </p>
                <p>
                  {
                    'If you do this, make sure you give Earthstar a chance to sync with pubs and get your empty versions out there, before you turn off your computer or log out of the workspace.'
                  }
                </p>
              </div>
            </details>
          </section>
        </>
      ) : (
        <button
          data-re-button
          onClick={() => {
            setIsDangerZoneShown(true);
          }}
        >
          {'Data deletion settings'}
        </button>
      )}
    </div>
  );
}
