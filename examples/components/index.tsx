import React from 'react';
import { render } from 'react-dom';
import { StorageMemory, ValidatorEs4 } from 'earthstar';
import {
  EarthstarPeer,
  CurrentAuthor,
  AddWorkspaceForm,
  AuthorKeypairForm,
  AuthorKeypairUpload,
  AuthorLabel,
  DisplayNameForm,
  DownloadKeypairButton,
  NewKeypairForm,
  PubEditor,
  SignOutButton,
  WorkspaceLabel,
} from '../../src/index';

const EXAMPLE_WORKSPACE_ADDR = '+example.a123';

function Example({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section
      style={{
        marginBottom: '2em',
      }}
    >
      <h2 style={{ margin: '0 0 .5em 0', color: '#bebebe', fontSize: '1em' }}>
        <pre>{title}</pre>
      </h2>
      <div style={{ border: '1px solid #e9e9e9', padding: '1em' }}>
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
        ]}
      >
        <Example title={'AddWorkspaceForm'}>
          <AddWorkspaceForm />
        </Example>
        <Example title={'AuthorKeypairForm'}>
          <AuthorKeypairForm />
        </Example>
        <Example title={'AuthorKeypairUpload'}>
          <AuthorKeypairUpload />
        </Example>
        <Example title={'AuthorLabel'}>
          <AuthorLabel
            address={
              '@suzy.b63a5eqlqqkv5im37s6vebgf3ledhkyt63gzt4ylvcyatlxmrprma'
            }
          />
        </Example>
        <Example title={'CurrentAuthor'}>
          <CurrentAuthor />
        </Example>
        <Example title={'DisplayNameForm'}>
          <DisplayNameForm workspace={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
        <Example title={'DownloadKeypairButton'}>
          <DownloadKeypairButton />
        </Example>
        <Example title={'NewKeypairForm'}>
          <NewKeypairForm />
        </Example>
        <Example title={'PubEditor'}>
          <PubEditor workspace={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
        <Example title={'SignOutButton'}>
          <SignOutButton />
        </Example>
        <Example title={'WorkspaceLabel'}>
          <WorkspaceLabel address={EXAMPLE_WORKSPACE_ADDR} />
        </Example>
      </EarthstarPeer>
    </>
  );
}

render(<Examples />, document.getElementById('root'));
