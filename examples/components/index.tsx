import React from 'react';
import { render } from 'react-dom';
import { StorageMemory, ValidatorEs4 } from 'earthstar';
import {
  AddWorkspaceForm,
  AuthorKeypairForm,
  AuthorKeypairUpload,
  AuthorLabel,
  CurrentAuthor,
  DisplayNameForm,
  DownloadKeypairButton,
  EarthstarPeer,
  NewKeypairForm,
  PubEditor,
  SignOutButton,
  WorkspaceLabel,
} from '../../src/index';

const EXAMPLE_WORKSPACE_ADDR = '+example.a123';

function Example({
  children,
  title,
  notes,
}: {
  children: React.ReactNode;
  title: string;
  notes?: string;
}) {
  return (
    <section
      style={{
        marginBottom: '2em',
      }}
    >
      <h3
        style={{
          margin: '1em 0 0.5rem 1rem',
          padding: 0,
          color: '#3a5',
          fontSize: '1.5em',
        }}
      >
        <code>{title}</code>
      </h3>
      <div
        style={{
          margin: '0 0 0.5rem 1rem',
          fontStyle: 'italic',
          color: '#084',
        }}
      >
        {notes}
      </div>
      <div
        style={{
          margin: '0 1rem 0 2rem',
          border: '2px solid #eee',
          padding: '0.5em',
          borderRadius: 10,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Examples() {
  return (
    <>
      <h1>react-earthstar components</h1>
      <EarthstarPeer
        initWorkspaces={[
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR + 'b'),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR + 'c'),
        ]}
      >
        <hr />
        <h2>Adding and editing workspaces</h2>
        <Example
          title={'AddWorkspaceForm'}
          notes="Add a new workspace to the list of possible workspaces"
        >
          <AddWorkspaceForm />
        </Example>
        <Example
          title={'PubEditor'}
          notes="Add or remove pubs from a given workspace.  Input: a workspace address"
        >
          <PubEditor workspace={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
        <hr />
        <h2>Current author: logging in and signing up</h2>
        <Example
          title={'AuthorKeypairForm'}
          notes="Log in with an author address and secret"
        >
          <AuthorKeypairForm />
        </Example>
        <Example
          title={'AuthorKeypairUpload'}
          notes="Log in with a keypair.json file"
        >
          <AuthorKeypairUpload />
        </Example>
        <Example
          title={'NewKeypairForm'}
          notes="Generate a new author keypair and sign in"
        >
          <NewKeypairForm />
        </Example>
        <hr />
        <h2>Current author: logging out</h2>
        <Example title={'DownloadKeypairButton'}>
          <DownloadKeypairButton />
        </Example>
        <Example title={'SignOutButton'}>
          <SignOutButton />
        </Example>
        <hr />
        <h2>Current author: etc</h2>
        <Example
          title={'CurrentAuthor'}
          notes="Display an <AuthorLabel> which abbreviates the currenly signed in author's address"
        >
          <CurrentAuthor />
        </Example>
        <Example
          title={'DisplayNameForm'}
          notes="Change the display name of the currently signed in author, in a given workspace"
        >
          <DisplayNameForm workspace={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
        <hr />
        <h2>Stateless helpers</h2>
        <Example
          title={'AuthorLabel'}
          notes="Abbreviate an author address for easy viewing"
        >
          <AuthorLabel
            address={
              '@suzy.b63a5eqlqqkv5im37s6vebgf3ledhkyt63gzt4ylvcyatlxmrprma'
            }
          />
        </Example>
        <Example
          title={'WorkspaceLabel'}
          notes="Abbreviate an workspace address for easy viewing"
        >
          <WorkspaceLabel address={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
      </EarthstarPeer>
    </>
  );
}

render(<Examples />, document.getElementById('root'));
