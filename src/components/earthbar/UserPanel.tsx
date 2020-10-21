import React from 'react';

import {
  SignOutButton,
  DownloadKeypairButton,
  DisplayNameForm,
  AuthorLabel,
} from '../';
import { useWorkspaces, useDocument, useCurrentAuthor } from '../..';

export default function UserPanel() {
  const [currentAuthor] = useCurrentAuthor();
  const workspaces = useWorkspaces();
  const [selectedWorkspace, setSelectedWorkspace] = React.useState(
    workspaces[0]
  );

  console.log(selectedWorkspace);

  const [displayNameDoc] = useDocument(
    selectedWorkspace,
    `/about/${currentAuthor?.address}/name`
  );

  if (!currentAuthor) {
    return (
      <div>
        <p>{"You're not signed in!"}</p>
      </div>
    );
  }

  return (
    <div>
      <section>
        <header>
          <h1>
            <AuthorLabel address={currentAuthor.address} />
          </h1>
          {workspaces.length > 0 ? (
            <>
              <h2>
                {'Your appearance on '}
                <select
                  value={selectedWorkspace}
                  onChange={e => setSelectedWorkspace(e.target.value)}
                >
                  {workspaces.map(address => (
                    <option key={address} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
              </h2>
              <div>{displayNameDoc?.content || '(No display name set)'}</div>
              {/* TODO: Add an avatar changing form*/}
              <DisplayNameForm workspace={selectedWorkspace} />
            </>
          ) : null}
        </header>
      </section>
      <hr />
      <section>
        <DownloadKeypairButton />
        <SignOutButton />
      </section>
    </div>
  );
}
