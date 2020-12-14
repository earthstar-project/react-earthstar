import React from 'react';
import { EarthbarTabPanel } from './Earthbar';

import {
  AuthorLabel,
  CopyAuthorAddressButton,
  CopyAuthorSecretButton,
  DisplayNameForm,
  DownloadKeypairButton,
  SignOutButton,
} from '../';
import { useCurrentAuthor, useCurrentWorkspace } from '../..';

export default function UserPanel() {
  const [currentAuthor] = useCurrentAuthor();
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <EarthbarTabPanel data-react-earthstar-user-panel>
      <h1 data-react-earthstar-user-panel-author-address>
        {currentAuthor ? (
          <AuthorLabel address={currentAuthor.address} />
        ) : (
          'Not signed in'
        )}
      </h1>
      {currentWorkspace ? (
        <>
          <hr />
          <section data-react-earthstar-user-panel-display-name-section>
            <DisplayNameForm workspaceAddress={currentWorkspace} />
          </section>
        </>
      ) : null}
      <hr />
      <section data-react-earthstar-user-panel-save-identity-section>
        <h1 data-react-earthstar-user-panel-save-identity-title>
          {'Save your identity'}
        </h1>
        <DownloadKeypairButton />
        <CopyAuthorAddressButton />
        <CopyAuthorSecretButton />
      </section>
      <hr />
      <section data-react-earthstar-user-panel-sign-out-section>
        <SignOutButton />
      </section>
    </EarthbarTabPanel>
  );
}
