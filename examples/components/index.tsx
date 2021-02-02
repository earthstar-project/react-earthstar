import React from 'react';
import { render } from 'react-dom';
import {
  StorageMemory,
  ValidatorEs4,
  generateAuthorKeypair,
  AuthorKeypair,
} from 'earthstar';
import {
  EarthstarPeer,
  AddWorkspaceForm,
  AuthorKeypairForm,
  AuthorKeypairUpload,
  AuthorLabel,
  CopyAuthorAddressButton,
  CopyAuthorSecretButton,
  CurrentAuthor,
  CurrentWorkspaceSelect,
  DisplayNameForm,
  DownloadKeypairButton,
  InvitationCreatorForm,
  InvitationRedemptionForm,
  NewKeypairForm,
  PubEditor,
  RemoveWorkspaceButton,
  SignOutButton,
  WorkspaceCreatorForm,
  WorkspaceLabel,
  WorkspaceList,
  SyncingCheckbox,
} from '../../src/index';
import '../../styles/layout.css';
import '../../styles/junior.css';

const EXAMPLE_WORKSPACE_ADDR1 = '+example.a123';
const EXAMPLE_WORKSPACE_ADDR2 = '+gardening.a123';
const EXAMPLE_WORKSPACE_ADDR3 = '+sailing.a123';

const EXAMPLE_USER = generateAuthorKeypair('test') as AuthorKeypair;

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
          color: '#097',
          fontSize: '1.5em',
        }}
      >
        <code>{title}</code>
      </h3>
      <div
        style={{
          margin: '0 0 0.5rem 1rem',
          fontStyle: 'italic',
          color: '#097',
        }}
      >
        {notes}
      </div>
      <div
        style={{
          margin: '0 1rem 0 2rem',
          border: '2px dotted #888',
          padding: '1em',
          boxShadow: '5px 5px 5px 0px rgba(0,0,0,0.3)',
          background: '#eee',
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
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR1),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR2),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR3),
        ]}
        initPubs={{
          [EXAMPLE_WORKSPACE_ADDR1]: ['https://a.pub/', 'https://z.pub/'],
          [EXAMPLE_WORKSPACE_ADDR2]: ['https://b.pub/'],
          [EXAMPLE_WORKSPACE_ADDR3]: ['https://c.pub/'],
        }}
        initIsLive={false}
        initCurrentAuthor={EXAMPLE_USER}
      >
        <hr />
        <h2>Adding, removing and editing workspaces</h2>
        <Example
          title={'CurrentWorkspaceSelect'}
          notes={'Select the currently active workspace'}
        >
          <CurrentWorkspaceSelect />
        </Example>
        <Example
          title={'AddWorkspaceForm'}
          notes="Add a new workspace to the list of possible workspaces"
        >
          <AddWorkspaceForm />
        </Example>
        <Example title={'WorkspaceCreatorForm'}>
          <WorkspaceCreatorForm />
        </Example>
        <Example
          title={'InvitationRedemptionForm'}
          notes={'Add a workspace using an Earthstar invitation code'}
        >
          <InvitationRedemptionForm />
        </Example>
        <Example
          title={'SyncingCheckbox'}
          notes={'Toggle whether a workspace is syncing or not'}
        >
          <SyncingCheckbox />
        </Example>
        <Example
          title={'InvitationCreatorForm'}
          notes={'Create Earthstar invitation code from a workspace'}
        >
          <InvitationCreatorForm workspaceAddress={EXAMPLE_WORKSPACE_ADDR1} />
        </Example>
        <Example
          title={'RemoveWorkspaceButton'}
          notes={'Remove a workspace from the list of known workspaces'}
        >
          <RemoveWorkspaceButton workspaceAddress={EXAMPLE_WORKSPACE_ADDR3}>
            {`Remove ${EXAMPLE_WORKSPACE_ADDR3}`}
          </RemoveWorkspaceButton>
        </Example>
        <Example
          title={'PubEditor'}
          notes="Add or remove pubs from a given workspace."
        >
          <PubEditor workspaceAddress={EXAMPLE_WORKSPACE_ADDR1} />
        </Example>
        <Example title={'WorkspaceList'} notes="List the known workspaces">
          <WorkspaceList />
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
        <h2>Current author: other actions</h2>
        <Example
          title={'CurrentAuthor'}
          notes="Display an <AuthorLabel> which abbreviates the currenly signed in author's address"
        >
          <CurrentAuthor />
        </Example>
        <Example
          title={'CopyAuthorAddressButton'}
          notes="A button which copies the current author's address to the clipboard"
        >
          <CopyAuthorAddressButton />
        </Example>
        <Example
          title={'CopyAuthorSecretButton'}
          notes="A button which copies the current author's secret to the clipboard"
        >
          <CopyAuthorSecretButton />
        </Example>
        <Example
          title={'DisplayNameForm'}
          notes="Change the display name of the currently signed in author, in a given workspace, by writing a document to /about/~@zzzz.bbbbbb/displayName.txt"
        >
          <DisplayNameForm workspaceAddress={EXAMPLE_WORKSPACE_ADDR1} />
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
          notes="Abbreviate a workspace address for easy viewing"
        >
          <WorkspaceLabel address={EXAMPLE_WORKSPACE_ADDR1} />
        </Example>
      </EarthstarPeer>
    </>
  );
}

render(<Examples />, document.getElementById('root'));
