import * as React from 'react';
import EarthbarTabPanel from './EarthbarTabPanel';
import {
  CopyAuthorAddressButton,
  CopyAuthorSecretButton,
  DisplayNameForm,
  DownloadKeypairButton,
  SignOutButton,
} from '../';
import { useCurrentAuthor, useCurrentWorkspace } from '../../hooks';
import {
  CanITellMyIdentity,
  HowDoIdentitiesWork,
  WhyDoINeedToSaveMyIdentity,
} from '../guidance/guidances';

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
        <WhyDoINeedToSaveMyIdentity />
        <CanITellMyIdentity />
        <HowDoIdentitiesWork />
      </section>
      <hr />
      <section data-re-user-panel-sign-out-section>
        <SignOutButton />
      </section>
    </EarthbarTabPanel>
  );
}
