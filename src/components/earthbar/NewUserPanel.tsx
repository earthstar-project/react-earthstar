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
      <section data-re-new-user-panel-make-section>
        <h1 data-re-new-user-panel-make-section-title>
          {'Make a new author identity'}
        </h1>
        <NewKeypairForm />
        <details data-re-details>
          <summary data-re-summary>{'What is an author identity?'}</summary>
          <div data-re-details-content>
            <p>
              {
                "It's like a user account. You can write data to workspaces with it."
              }
            </p>
            <p>
              {
                "It's made up of a public address, which starts with the four letter nickname entered above, and a secret which only you know."
              }
            </p>
            <p>
              {
                'Using these two elements, Earthstar apps can prove you are who you say you are using cryptography.'
              }
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
              {
                'No. However, your author nickname will not be the primary way you are represented in most apps.'
              }
            </p>
            <p>
              {
                "After creating an identity you'll be able to set a display name, which can be any length, and can be changed at any time."
              }
            </p>
          </div>
        </details>
        <details data-re-details>
          <summary data-re-summary>{'What will this form do?'}</summary>
          <div data-re-details-content>
            <p>{'A new, unique identity will be created for you.'}</p>
            <p>
              {'After doing this, '}
              <b>{'be sure to save your new identity on the next screen.'}</b>
            </p>
            <p>
              {
                'Either 1. Download the "keypair.json" file, or 2. Copy the address and secret to a safe place like a password manager. If you lose your login info, it can\'t be recovered.'
              }
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
