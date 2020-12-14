import React from 'react';
import { EarthbarTabPanel } from './Earthbar';
import {
  AuthorKeypairForm,
  AuthorKeypairUpload,
  NewKeypairForm,
} from '../../index';

export default function NewUserPanel() {
  return (
    <EarthbarTabPanel data-react-eartshar-new-user-panel>
      <section data-react-earthstar-new-user-panel-make-section>
        <h1 data-react-earthstar-new-user-panel-make-section-title>
          {'Make a new author identity'}
        </h1>
        <NewKeypairForm />
        <p data-react-earthstar-new-user-panel-make-section-note>
          A new, unique identity will be created for you.
        </p>
        <p data-react-earthstar-new-user-panel-make-section-note>
          After doing this,{' '}
          <b>be sure to save your new identity on the next screen.</b>
        </p>
        <p data-react-earthstar-new-user-panel-make-section-note>
          Either 1. Download the "keypair.json" file, or 2. Copy the address and
          secret to a safe place like a password manager. If you lose your login
          info, it can't be recovered.
        </p>
      </section>
      <hr />
      <section data-react-earthstar-new-user-panel-login-section>
        <h1 data-react-earthstar-new-user-panel-login-section-title>
          {'Log in'}
        </h1>
        <AuthorKeypairForm />
        <div data-react-earthstar-new-user-panel-or>{'or '}</div>
        <AuthorKeypairUpload />
      </section>
    </EarthbarTabPanel>
  );
}
