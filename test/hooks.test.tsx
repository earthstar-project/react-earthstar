import * as React from 'react';
import {
  ValidatorEs4,
  StorageMemory,
  Query,
  generateAuthorKeypair,
  AuthorKeypair,
  WriteEvent,
  isErr,
  EarthstarError,
  sleep,
  StorageToAsync,
  syncLocal,
} from 'earthstar';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  EarthstarPeer,
  useWorkspaces,
  useAddWorkspace,
  useRemoveWorkspace,
  useWorkspacePubs,
  usePubs,
  usePaths,
  useDocument,
  useStorages,
  useSubscribeToStorages,
  useCurrentWorkspace,
  useInvitation,
  useMakeInvitation,
  useDocuments,
  useStorage,
  LocalStorageSettingsWriter,
  useLocalStorageEarthstarSettings,
} from '../src';
import StorageMemoryCache from '../src/StorageMemoryCache';

const keypair = generateAuthorKeypair('onee') as AuthorKeypair;
const otherKeypair = generateAuthorKeypair('twoo') as AuthorKeypair;

const WORKSPACE_ADDR_A = '+testa.a123';
const WORKSPACE_ADDR_B = '+testb.b234';
const WORKSPACE_ADDR_C = '+testc.c567';

const PUB_A = 'https://a.pub';
const PUB_B = 'https://b.pub';
const PUB_C = 'https://c.pub';

const pubs = {
  [WORKSPACE_ADDR_A]: [PUB_A],
  [WORKSPACE_ADDR_B]: [PUB_B],
  [WORKSPACE_ADDR_C]: [PUB_C],
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <EarthstarPeer
      initWorkspaces={[WORKSPACE_ADDR_A, WORKSPACE_ADDR_B, WORKSPACE_ADDR_C]}
      initPubs={pubs}
      initCurrentAuthor={keypair}
      initIsLive={false}
      initCurrentWorkspace={WORKSPACE_ADDR_A}
      onCreateWorkspace={workspaceAddress => {
        return new StorageMemoryCache([ValidatorEs4], workspaceAddress, () => {
          return new StorageToAsync(
            new StorageMemory([ValidatorEs4], workspaceAddress)
          );
        });
      }}
    >
      {children}
      <LocalStorageSettingsWriter storageKey={'tests'} />
    </EarthstarPeer>
  );
};

test('useWorkspace', () => {
  const { result } = renderHook(() => useWorkspaces(), { wrapper });

  expect(result.current).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
    WORKSPACE_ADDR_C,
  ]);
});

test('useAddWorkspace ', () => {
  const useTest = () => {
    const add = useAddWorkspace();
    const workspaces = useWorkspaces();

    return { add, workspaces };
  };

  const { result } = renderHook(() => useTest(), { wrapper });

  act(() => {
    result.current.add('+testd.d789');
  });

  expect(result.current.workspaces).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
    WORKSPACE_ADDR_C,
    '+testd.d789',
  ]);

  // Can't add a workspace twice
  act(() => {
    result.current.add(WORKSPACE_ADDR_A);
  });

  expect(result.current.workspaces).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
    WORKSPACE_ADDR_C,
    '+testd.d789',
  ]);
});

test('useRemoveWorkspace', async () => {
  const useTest = () => {
    const [storages] = useStorages();
    const remove = useRemoveWorkspace();
    const workspaces = useWorkspaces();

    return { remove, workspaces, storages };
  };

  const { result } = renderHook(() => useTest(), {
    wrapper,
  });

  const storage = result.current.storages[WORKSPACE_ADDR_C];

  expect(storage.isClosed()).toBeFalsy();

  await act(() => {
    result.current.remove(WORKSPACE_ADDR_C);
  });

  expect(storage.isClosed()).toBeTruthy();

  expect(result.current.workspaces).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
  ]);
});

test('useWorkspacePubs', () => {
  const { result } = renderHook(() => useWorkspacePubs(WORKSPACE_ADDR_A), {
    wrapper,
  });

  expect(result.current[0]).toEqual([PUB_A]);

  act(() => {
    result.current[1](prev => [...prev, PUB_B]);
  });

  expect(result.current[0]).toEqual([PUB_A, PUB_B]);
});

test('usePubs', () => {
  const { result } = renderHook(() => usePubs(), {
    wrapper,
  });

  expect(result.current[0]).toEqual(pubs);

  act(() => {
    result.current[1]({ [WORKSPACE_ADDR_A]: [PUB_C] });
  });

  expect(result.current[0]).toEqual({ [WORKSPACE_ADDR_A]: [PUB_C] });
});

test.todo('useSync');

test('useCurrentWorkspace', () => {
  const { result } = renderHook(() => useCurrentWorkspace(), {
    wrapper,
  });

  expect(result.current[0]).toEqual(WORKSPACE_ADDR_A);

  act(() => {
    result.current[1](WORKSPACE_ADDR_B);
  });

  expect(result.current[0]).toEqual(WORKSPACE_ADDR_B);

  act(() => {
    result.current[1]('+somethingunknown.a123');
  });

  expect(result.current[0]).toEqual(null);
});

test('usePaths', async () => {
  const useTest = (q: Query) => {
    const [query, setQuery] = React.useState(q);
    const paths = usePaths(query, WORKSPACE_ADDR_A);
    const [storages] = useStorages();

    return { paths, storage: storages[WORKSPACE_ADDR_A], setQuery };
  };

  const { result, waitForNextUpdate } = renderHook(
    () =>
      useTest({
        pathStartsWith: '/path-test/',
      }),
    { wrapper }
  );

  expect(result.current.paths).toEqual([]);

  act(() => {
    result.current.storage.set(keypair, {
      format: 'es.4',
      path: '/path-test/1',
      content: 'Hello!',
    });
  });

  await waitForNextUpdate();

  expect(result.current.paths).toEqual(['/path-test/1']);

  act(() => {
    result.current.setQuery({ pathStartsWith: '/nothing' });
  });

  expect(result.current.paths).toEqual([]);
});

test('useDocument', async () => {
  const useTest = () => {
    const [storages] = useStorages();
    const [path, setPath] = React.useState('/test/test.txt');
    const [workspace, setWorkspace] = React.useState(WORKSPACE_ADDR_A);
    const [doc, setDoc, deleteDoc] = useDocument(path, workspace);

    return { setWorkspace, setPath, doc, setDoc, deleteDoc, storages };
  };

  const { result } = renderHook(() => useTest(), {
    wrapper,
  });

  expect(result.current.doc).toBeUndefined();

  act(() => {
    result.current.setDoc('Hey!');
  });

  // NB: We do not need to await results here as the cache storage is designed to synchronously set the new doc to storage.

  expect(result.current.doc?.content).toEqual('Hey!');

  act(() => {
    result.current.deleteDoc();
  });

  expect(result.current.doc?.content).toEqual('');

  act(() => {
    result.current.setPath('/test/no.txt');
  });

  expect(result.current.doc?.content).toBeUndefined();

  act(() => {
    result.current.storages[WORKSPACE_ADDR_B].set(keypair, {
      format: 'es.4',
      path: '/test/workspace-changed.txt',
      content: 'Switched!',
    });
    result.current.setWorkspace(WORKSPACE_ADDR_B);
    result.current.setPath('/test/workspace-changed.txt');
  });

  expect(result.current.doc?.content).toEqual('Switched!');
});

test('useDocuments', async () => {
  const useTest = (q: Query) => {
    const [query, setQuery] = React.useState(q);
    const [workspace, setWorkspace] = React.useState(WORKSPACE_ADDR_A);
    const docs = useDocuments(query, workspace);
    const storage = useStorage(workspace);

    return { docs, storage, setQuery, setWorkspace };
  };

  const { result, waitForNextUpdate } = renderHook(
    () =>
      useTest({
        pathStartsWith: '/documents-test',
      }),
    { wrapper }
  );

  expect(result.current.docs).toEqual([]);

  act(() => {
    result.current.storage?.set(keypair, {
      format: 'es.4',
      path: '/documents-test/1',
      content: 'A!',
    });
    result.current.storage?.set(keypair, {
      format: 'es.4',
      path: '/documents-test/2',
      content: 'B!',
    });
    result.current.storage?.set(keypair, {
      format: 'es.4',
      path: '/documents-test/3',
      content: 'C!',
    });
  });

  await waitForNextUpdate();

  expect(result.current.docs.length).toEqual(3);
  expect(result.current.docs.map(doc => doc.content)).toEqual([
    'A!',
    'B!',
    'C!',
  ]);

  act(() => {
    result.current.setWorkspace(WORKSPACE_ADDR_B);
  });

  expect(result.current.docs.length).toEqual(0);
});

test('useSubscribeToStorages', async () => {
  const useTest = (options?: {
    workspaces?: string[];
    paths?: string[];
    history?: Query['history'];
  }) => {
    const [storages] = useStorages();
    const [event, setEvent] = React.useState<WriteEvent | null>(null);

    const onWrite = React.useCallback(
      (event: WriteEvent) => {
        act(() => {
          setEvent(event);
        });
      },
      [setEvent]
    );

    useSubscribeToStorages({
      ...options,
      onWrite,
    });

    return { event: event, storages };
  };

  const { result, waitForNextUpdate } = renderHook(() => useTest(), {
    wrapper,
  });

  expect(result.current.event).toEqual(null);

  act(() => {
    result.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/subscribe-test/1',
    });
  });

  await waitForNextUpdate();

  expect(result.current.event?.document.path).toEqual('/subscribe-test/1');
  expect(result.current.event?.document.workspace).toEqual(WORKSPACE_ADDR_A);
  expect(result.current.event?.document.author).toEqual(keypair.address);

  // Can listen for specific workspaces
  const {
    result: workspaceResult,
    waitForNextUpdate: workspaceWait,
  } = renderHook(
    () =>
      useTest({
        workspaces: [WORKSPACE_ADDR_B],
      }),
    { wrapper }
  );

  expect(workspaceResult.current.event).toEqual(null);

  act(() => {
    workspaceResult.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/test/1',
    });
  });

  expect(workspaceResult.current.event).toEqual(null);

  act(() => {
    workspaceResult.current.storages[WORKSPACE_ADDR_B].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/test/2',
    });
  });

  await workspaceWait();

  expect(workspaceResult.current.event?.document.path).toEqual('/test/2');
  expect(workspaceResult.current.event?.document.workspace).toEqual(
    WORKSPACE_ADDR_B
  );
  expect(workspaceResult.current.event?.document.author).toEqual(
    keypair.address
  );

  // Can listen for paths
  const { result: pathResult, waitForNextUpdate: pathWait } = renderHook(
    () =>
      useTest({
        paths: ['/test/b'],
      }),
    { wrapper }
  );

  expect(pathResult.current.event).toEqual(null);

  act(() => {
    pathResult.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/test/a',
    });
  });

  expect(pathResult.current.event).toEqual(null);

  act(() => {
    pathResult.current.storages[WORKSPACE_ADDR_B].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/test/b',
    });
  });

  await pathWait();

  expect(pathResult.current.event?.document.path).toEqual('/test/b');

  // Can listen for all history
  const { result: historyResult, waitForNextUpdate: historyWait } = renderHook(
    () =>
      useTest({
        history: 'all',
      }),
    { wrapper }
  );

  expect(historyResult.current.event).toEqual(null);

  const publishDate = Date.now() * 1000;

  act(() => {
    historyResult.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Latest!',
      path: '/test/history',
      timestamp: publishDate,
    });
  });

  await historyWait();
  expect(historyResult.current.event?.document.content).toEqual('Latest!');
  expect(historyResult.current.event?.document.author).toEqual(keypair.address);
  expect(historyResult.current.event?.document.path).toEqual('/test/history');
  expect(historyResult.current.event?.document.workspace).toEqual(
    WORKSPACE_ADDR_A
  );
  expect(historyResult.current.event?.document.timestamp).toEqual(publishDate);

  const otherStorage = new StorageMemory([ValidatorEs4], WORKSPACE_ADDR_A);

  act(() => {
    otherStorage.set(otherKeypair, {
      format: 'es.4',
      content: 'Oldest!',
      path: '/test/history',
      timestamp: publishDate - 10000,
    });

    syncLocal(historyResult.current.storages[WORKSPACE_ADDR_A], otherStorage);
  });

  await historyWait();

  expect(historyResult.current.event?.isLocal).toBeFalsy();
  expect(historyResult.current.event?.document.content).toEqual('Oldest!');
  expect(historyResult.current.event?.document.author).toEqual(
    otherKeypair.address
  );
  expect(historyResult.current.event?.document.path).toEqual('/test/history');
  expect(historyResult.current.event?.document.workspace).toEqual(
    WORKSPACE_ADDR_A
  );
  expect(historyResult.current.event?.document.timestamp).toEqual(
    publishDate - 10000
  );
});

test('useInvitation', () => {
  const VALID_URL =
    'earthstar:///?workspace=+gardening.abc&pub=http://pub1.org&pub=https://pub2.org&v=1';

  const useTest = () => {
    const [code, setCode] = React.useState(VALID_URL);
    const invitationResult = useInvitation(code);

    return { invitationResult, setCode };
  };

  const { result } = renderHook(() => useTest(), { wrapper });

  expect(isErr(result.current.invitationResult)).toBeFalsy();

  act(() => result.current.setCode('http://dogs.com'));

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    'Invitation not a valid Earthstar URL'
  );

  act(() =>
    result.current.setCode(
      'earthstar:///?workspace=+gardening.abc&pub=http://pub1.org&pub=https://pub2.org&v=46'
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    'Unrecognised Earthstar invitation format version'
  );

  act(() =>
    result.current.setCode(
      'earthstar:///?pub=http://pub1.org&pub=https://pub2.org&v=1'
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    'No workspace found in Earthstar invitation URL'
  );

  act(() =>
    result.current.setCode(
      'earthstar:///?workspace=+gardening.abc&pub=blorp&v=1'
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    'Malformed Pub URL found'
  );

  act(() => result.current.setCode('bong'));

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    'Not a valid Earthstar URL'
  );
});

test('useMakeInvitation', () => {
  const useTest = () => {
    const [workspace, setWorkspace] = React.useState(WORKSPACE_ADDR_A);
    const [excludedPubs, setExcludedPubs] = React.useState<string[]>([]);
    const invitationCode = useMakeInvitation(excludedPubs, workspace);

    return { setWorkspace, setExcludedPubs, invitationCode };
  };

  const { result } = renderHook(() => useTest(), { wrapper });

  expect(result.current.invitationCode).toEqual(
    'earthstar:///?workspace=+testa.a123&pub=https://a.pub&v=1'
  );

  act(() => {
    result.current.setExcludedPubs([PUB_A]);
  });

  expect(result.current.invitationCode).toEqual(
    'earthstar:///?workspace=+testa.a123&v=1'
  );
});

test('useLocalStorageSettings', () => {
  const { result } = renderHook(
    () => useLocalStorageEarthstarSettings('tests'),
    { wrapper }
  );

  expect(result.current.initWorkspaces).toHaveLength(3);
  expect(result.current.initPubs).toEqual({
    '+testa.a123': ['https://a.pub'],
    '+testb.b234': ['https://b.pub'],
    '+testc.c567': ['https://c.pub'],
  });
  expect(result.current.initCurrentAuthor).toBeDefined();
  expect(result.current.initCurrentWorkspace).toBe(WORKSPACE_ADDR_A);
});

test('useStorage', async () => {
  const useTest = () => {
    const [storages, setStorages] = useStorages();

    const workspaces = useWorkspaces();

    return { workspaces, storages, setStorages };
  };

  const { result } = renderHook(() => useTest(), {
    wrapper,
  });

  const storage = result.current.storages[WORKSPACE_ADDR_C];

  expect(storage.isClosed()).toBeFalsy();

  act(() => {
    result.current.setStorages(prev => {
      const prevCopy = { ...prev };

      delete prevCopy[WORKSPACE_ADDR_C];

      return prevCopy;
    });
  });

  // Wait a tick for Earthstar peer to close the removed storage
  await sleep(0);

  // Removed workspaces should be closed by EarthstarPeer
  expect(storage.isClosed()).toBeTruthy();

  expect(result.current.workspaces).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
  ]);
});
