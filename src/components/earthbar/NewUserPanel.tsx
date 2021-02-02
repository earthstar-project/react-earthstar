import * as React from 'react';
import EarthbarTabPanel from './EarthbarTabPanel';
import AuthorKeypairForm from '../AuthorKeypairForm';
import AuthorKeypairUpload from '../AuthorKeypairUpload';
import NewKeypairForm from '../NewKeypairForm';

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
        <details data-re-details>
          <summary data-re-summary>{'What is an author identity?'}</summary>
          <div data-re-details-content>
            <p>
              {
                "It's like a user account. You can write data to workspaces with it."
              }
            </p>
            <p>
              It has a public <b>address</b> made of a 4 letter nickname plus a
              cryptographic public key, and a cryptographic <b>secret</b> that's
              similar to a password.
            </p>
            <p>
              {
                'You can have many identities, or use a single one across many workspaces.'
              }
            </p>
          </div>
        </details>
        <details data-re-details>
          <summary data-re-summary>{'Can I change my nickname later?'}</summary>
          <div data-re-details-content>
            <p>
              No, but after you sign in you can set a <b>display name</b> which
              you can change whenever you like.
            </p>
          </div>
        </details>
      </section>
      <hr />
      <section data-re-new-user-panel-login-section>
        <h1 data-re-new-user-panel-login-section-title>{'Log in'}</h1>
        <AuthorKeypairForm />
        <hr />
        <AuthorKeypairUpload />
        <details data-re-details>
          <summary data-re-summary>
            {'I lost my secret, can I reset it?'}
          </summary>
          <div data-re-details-content>
            <p>
              {
                'Unfortunately not! Your public address and secret are tied together, and neither can be changed after creation.'
              }
            </p>
            <p>
              {
                "If you've lost your secret, the best thing to to do is create a new identity and tell your friends about it."
              }
            </p>
          </div>
        </details>
      </section>
    </EarthbarTabPanel>
  );
}
