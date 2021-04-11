import * as React from 'react';
import { render } from 'react-dom';
import {
  ValidatorEs4,
  generateAuthorKeypair,
  AuthorKeypair,
  setLogLevels,
  StorageLocalStorage,
} from 'earthstar';
import {
  EarthstarPeer,
  Earthbar,
  AuthorTab,
  Spacer,
  MultiWorkspaceTab,
  LocalStorageSettingsWriter,
  useLocalStorageEarthstarSettings,
  useStorage,
  useCurrentWorkspace,
  useCurrentAuthor,
} from '../../src/index';
import '../../styles/layout.css';
import '../../styles/junior.css';

const EXAMPLE_WORKSPACE_ADDR1 = '+example.a123';
const EXAMPLE_WORKSPACE_ADDR2 = '+gardening.a123';
const EXAMPLE_WORKSPACE_ADDR3 = '+sailing.a123';

const EXAMPLE_USER = generateAuthorKeypair('test') as AuthorKeypair;

// 0: error, 1: warn, 2: log, 3: debug
setLogLevels({
  sync: 1,
  syncer2: 1,
  storage: 1,
  _other: 1,
});

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

const workspaces = [
  EXAMPLE_WORKSPACE_ADDR1,
  EXAMPLE_WORKSPACE_ADDR2,
  EXAMPLE_WORKSPACE_ADDR3,
];

function OnlyWorkspace({ children }: { children: React.ReactNode }) {
  const [currentWorkspace] = useCurrentWorkspace();

  if (!currentWorkspace) {
    return null;
  }

  return <>{children}</>;
}

function Test() {
  const storage = useStorage();
  const [currentAuthor] = useCurrentAuthor();
  const [lastCreatedDoc, setLastCreatedDoc] = React.useState<
    string | undefined
  >();

  const files = storage.documents({ pathStartsWith: '/directory/' });
  const mostRecent = lastCreatedDoc
    ? storage.getDocument(lastCreatedDoc)
    : null;

  return (
    <div>
      <h1>{'My directory'}</h1>
      {currentAuthor ? (
        <button
          onClick={() => {
            const path = `/directory/${Date.now()}.txt`;

            storage.set(currentAuthor, {
              content: 'Hello world!',
              format: 'es.4',
              path,
            });

            setLastCreatedDoc(path);
          }}
        >
          Add file
        </button>
      ) : null}
      {mostRecent ? (
        <div>
          <h2>Most Recent</h2>
          <div>
            <b>{mostRecent.path}</b>: {mostRecent.content}
          </div>
        </div>
      ) : null}
      <h2>All files</h2>
      {files.map(file => (
        <li>
          <b>{file.path}</b>: {file.content}
        </li>
      ))}
    </div>
  );
}

function Examples() {
  const initValues = useLocalStorageEarthstarSettings('example');

  return (
    <>
      <h1>react-earthstar earthbar</h1>
      <EarthstarPeer
        initWorkspaces={workspaces}
        initPubs={pubs}
        initIsLive={false}
      >
        <OnlyWorkspace>
          <Test />
        </OnlyWorkspace>
        <hr />
        <EarthbarExample title={'Default Earthbar'}></EarthbarExample>
      </EarthstarPeer>
      <EarthstarPeer initIsLive={false}>
        <EarthbarExample title={'Earthbar for all-workspaces-at-once app'}>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
      </EarthstarPeer>
      <hr />
      <EarthstarPeer
        initWorkspaces={workspaces}
        initPubs={pubs}
        initIsLive={false}
        initCurrentAuthor={EXAMPLE_USER}
      >
        <EarthbarExample
          title={'Default Earthbar (signed in)'}
        ></EarthbarExample>
      </EarthstarPeer>
      <EarthstarPeer initIsLive={false}>
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
      </EarthstarPeer>
      <EarthstarPeer initIsLive={false}>
        <EarthbarExample title={'Multi, no workspaces'}>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </EarthbarExample>
      </EarthstarPeer>
      <hr />
      <EarthstarPeer
        {...initValues}
        initIsLive={false}
        onCreateWorkspace={workspaceAddress => {
          return new StorageLocalStorage([ValidatorEs4], workspaceAddress);
        }}
      >
        <EarthbarExample title={'From localstorage'} />
        <LocalStorageSettingsWriter storageKey={'example'} />
      </EarthstarPeer>
      <EarthstarPeer
        {...initValues}
        initIsLive={false}
        onCreateWorkspace={workspaceAddress => {
          return new StorageLocalStorage([ValidatorEs4], workspaceAddress);
        }}
      >
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
