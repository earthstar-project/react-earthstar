import * as React from 'react';
import EarthbarTabPanel from './EarthbarTabPanel';
import AuthorKeypairForm from '../AuthorKeypairForm';
import AuthorKeypairUpload from '../AuthorKeypairUpload';
import NewKeypairForm from '../NewKeypairForm';
import {
  CanIChangeMyNickname,
  CanIResetMySecret,
  WhatIsAnAuthorIdentity,
} from '../guidance/guidances';

export default function NewUserPanel() {
  return (
    <EarthbarTabPanel data-react-eartshar-new-user-panel>
      <section data-re-new-user-panel-make-section>
        <h1 data-re-new-user-panel-make-section-title>
          {'Make a new author identity'}
        </h1>
        <NewKeypairForm />
        <p>
          And be sure to <b>save your new identity on the next screen!</b>
        </p>
        <WhatIsAnAuthorIdentity />
        <CanIChangeMyNickname />
      </section>
      <hr />
      <section data-re-new-user-panel-login-section>
        <h1 data-re-new-user-panel-login-section-title>{'Log in'}</h1>
        <AuthorKeypairForm />
        <hr />
        <AuthorKeypairUpload />
        <CanIResetMySecret />
      </section>
    </EarthbarTabPanel>
  );
}
