import * as React from 'react';
import { render } from 'react-dom';
import {
  StorageMemory,
  ValidatorEs4,
  generateAuthorKeypair,
  AuthorKeypair,
} from 'earthstar';
import {
  EarthstarPeer,
  Earthbar,
  AuthorTab,
  Spacer,
  MultiWorkspaceTab,
  LocalStorageSettingsWriter,
  useLocalStorageEarthstarSettings,
} from '../../src/index';
import '../../styles/layout.css';
import '../../styles/junior.css';

const EXAMPLE_WORKSPACE_ADDR1 = '+example.a123';
const EXAMPLE_WORKSPACE_ADDR2 = '+gardening.a123';
const EXAMPLE_WORKSPACE_ADDR3 = '+sailing.a123';

const EXAMPLE_USER = generateAuthorKeypair('test') as AuthorKeypair;

const pubs = {
  [EXAMPLE_WORKSPACE_ADDR1]: [
    'https://my.pub',
    'https://your.pub',
    'https://their.pub',
  ],
};

function EarthbarExample({
  children,
  title,
  notes,
}: {
  children?: React.ReactNode;
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
        <Earthbar>{children}</Earthbar>
      </div>
    </section>
  );
}

function Examples() {
  const initValues = useLocalStorageEarthstarSettings('example');

  return (
    <>
      <h1>react-earthstar earthbar</h1>
      <EarthstarPeer
        initWorkspaces={[
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR1),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR2),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR3),
        ]}
        initPubs={pubs}
        initIsLive={false}
      >
        <hr />
        <EarthbarExample title={'Default Earthbar'}></EarthbarExample>

        <EarthbarExample title={'Earthbar for all-workspaces-at-once app'}>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
      </EarthstarPeer>
      <hr />
      <EarthstarPeer
        initWorkspaces={[
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR1),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR2),
          new StorageMemory([ValidatorEs4], EXAMPLE_WORKSPACE_ADDR3),
        ]}
        initPubs={pubs}
        initIsLive={false}
        initCurrentAuthor={EXAMPLE_USER}
      >
        <EarthbarExample
          title={'Default Earthbar (signed in)'}
        ></EarthbarExample>

        <EarthbarExample
          title={'Earthbar for all-workspaces-at-once app (signed in)'}
        >
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
      </EarthstarPeer>
      <hr />
      <EarthstarPeer initIsLive={false}>
        <EarthbarExample title={'No workspaces'} />
        <EarthbarExample title={'Multi, no workspaces'}>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
      </EarthstarPeer>
      <hr />
      <EarthstarPeer {...initValues} initIsLive={false}>
        <EarthbarExample title={'From localstorage'} />
        <EarthbarExample title={'Multi, from localstorage'}>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
        <LocalStorageSettingsWriter storageKey={'example'} />
      </EarthstarPeer>
    </>
  );
}

render(<Examples />, document.getElementById('root'));
