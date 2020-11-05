import React from 'react';
import { EarthbarTabPanel } from './Earthbar';

import { SignOutButton, DownloadKeypairButton, AuthorLabel } from '../';
import { useCurrentAuthor } from '../..';

export default function UserPanel() {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <EarthbarTabPanel data-react-earthstar-user-panel>
      <h1 data-react-earthstar-user-panel-author-address>
        {currentAuthor ? (
          <AuthorLabel address={currentAuthor.address} />
        ) : (
          'Not signed in'
        )}
      </h1>
      <hr />
      <section data-react-earthstar-user-panel-actions-section>
        <DownloadKeypairButton />
        <SignOutButton />
      </section>
    </EarthbarTabPanel>
  );
}
