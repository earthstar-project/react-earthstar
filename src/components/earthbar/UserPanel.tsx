import React from 'react';
import { EarthbarTabPanel } from './Earthbar';

import {
  SignOutButton,
  DownloadKeypairButton,
  AuthorLabel,
  DisplayNameForm,
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
          <section>
            <DisplayNameForm workspace={currentWorkspace} />
          </section>
        </>
      ) : null}
      <hr />
      <section data-react-earthstar-user-panel-actions-section>
        <DownloadKeypairButton />
        <SignOutButton />
      </section>
    </EarthbarTabPanel>
  );
}
