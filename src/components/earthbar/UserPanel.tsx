import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import {
  CopyAuthorAddressButton,
  CopyAuthorSecretButton,
  DisplayNameForm,
  DownloadKeypairButton,
  SignOutButton,
} from '../';
import { useCurrentWorkspace } from '../..';

export default function UserPanel() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTabPanel data-re-user-panel>
      {currentWorkspace ? (
        <>
          <section data-re-user-panel-display-name-section>
            <h1>{'Customize your identity'}</h1>
            <DisplayNameForm workspaceAddress={currentWorkspace} />
          </section>
          <hr />
        </>
      ) : null}

      <section data-re-user-panel-save-identity-section>
        <h1 data-re-user-panel-save-identity-title>{'Save your identity'}</h1>
        <DownloadKeypairButton />
        <CopyAuthorAddressButton />
        <CopyAuthorSecretButton />
        <details data-re-details>
          <summary data-re-summary>{'Why should I save my identity?'}</summary>
          <div data-re-details-content>
            <p>
              {
                'Your identity is not stored on any servers, so if you lose access to it there is no way to retrieve it.'
              }
            </p>
            <p>
              {'Should this happen, you will need to generate a new identity'}
            </p>
            <p>
              {
                'It is recommended to store your author identity address and secret or keypair.json in a password manager.'
              }
            </p>
          </div>
        </details>
      </section>
      <hr />
      <section data-re-user-panel-sign-out-section>
        <SignOutButton />
      </section>
    </EarthbarTabPanel>
  );
}
