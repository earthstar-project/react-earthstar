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
import { useCurrentAuthor } from '../../hooks';

export default function UserPanel() {
  const [currentWorkspace] = useCurrentWorkspace();
  let [keypair] = useCurrentAuthor();

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
        <dl>
          <dt>Your author address:</dt>
          <dd data-re-user-panel-address>
            <code>{keypair?.address || ''}</code>
          </dd>
          <dt>Your author secret: (select it to see it)</dt>
          <dd data-re-user-panel-secret>
            <code>{keypair?.secret || ''}</code>
          </dd>
        </dl>
        <hr />
        <CopyAuthorAddressButton />
        <CopyAuthorSecretButton />
        <hr />
        Or <DownloadKeypairButton /> containing your address and secret.
        <hr />
        <details data-re-details>
          <summary data-re-summary>
            {'Why do I need to save my identity?'}
          </summary>
          <div data-re-details-content>
            <p>
              {
                'Your identity is not stored on any servers, so if you lose access to it there is no way to retrieve it.'
              }
            </p>
            <p>
              {'Should this happen, you will need to generate a new identity.'}
            </p>
            <p>
              {
                'We recommend storing your author address and secret, or keypair.json, in a password manager.'
              }
            </p>
          </div>
        </details>
        <details data-re-details>
          <summary data-re-summary>
            {'Can I tell other people my identity?'}
          </summary>
          <div data-re-details-content>
            <p>
              It's safe to tell friends your author <b>address</b> -- the whole
              long thing.
            </p>
            <p>
              Since anyone can make an address with the same nickname as you,
              telling people your entire address will help them know they're not
              talking to an impostor.
            </p>
            <p>
              Don't share your <b>secret</b> -- treat it like a password.
            </p>
          </div>
        </details>
        <details data-re-details>
          <summary data-re-summary>
            {'How does this work under the hood?'}
          </summary>
          <div data-re-details-content>
            <p>
              Your address is a cryptographic public key, and your secret is the
              corresponding private key.
            </p>
            <p>
              Your data is signed, but not encrypted, with this keypair. Anyone
              can in the workspace can read it, but nobody can alter it or the
              signature would become invalid.
            </p>
            <p>
              Earthstar uses{' '}
              <a href="https://github.com/earthstar-project/earthstar/blob/master/docs/specification.md#ed25519-signatures">
                ed25519 keypairs encoded in base32.
              </a>
            </p>
            <p>
              The 4-character nickname is not part of the keypair but is
              considered part of your distinct identity. You can make multiple
              identities with the same keypair and different nicknames and they
              will be considered different identities. Here's more about{' '}
              <a href="https://github.com/earthstar-project/earthstar/blob/master/docs/specification.md#faq-author-shortnames">
                the reasoning behind this design.
              </a>
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
