import React from 'react';
import {
  ValidatorEs4,
  StorageMemory,
  QueryOpts,
  generateAuthorKeypair,
  AuthorKeypair,
  WriteEvent,
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
} from '../src';

const keypair = generateAuthorKeypair('test') as AuthorKeypair;
const otherKeypair = generateAuthorKeypair('test') as AuthorKeypair;

const WORKSPACE_ADDR_A = '+testa.a123';
const WORKSPACE_ADDR_B = '+testb.b234';
const WORKSPACE_ADDR_C = '+testc.c567';

const PUB_A = 'https://a.pub';
const PUB_B = 'https://b.pub';
const PUB_C = 'https://c.pub';

const storages = [WORKSPACE_ADDR_A, WORKSPACE_ADDR_B, WORKSPACE_ADDR_C].map(
  address => new StorageMemory([ValidatorEs4], address)
);

const pubs = {
  [WORKSPACE_ADDR_A]: [PUB_A],
  [WORKSPACE_ADDR_B]: [PUB_B],
  [WORKSPACE_ADDR_C]: [PUB_C],
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <EarthstarPeer
      initWorkspaces={storages}
      initPubs={pubs}
      initCurrentAuthor={keypair}
    >
      {children}
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

test('useRemoveWorkspace', () => {
  const useTest = () => {
    const remove = useRemoveWorkspace();
    const workspaces = useWorkspaces();

    return { remove, workspaces };
  };

  const { result } = renderHook(() => useTest(), { wrapper });

  act(() => {
    result.current.remove(WORKSPACE_ADDR_C);
  });

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

test('usePaths', () => {
  const useTest = (query: QueryOpts) => {
    const paths = usePaths(WORKSPACE_ADDR_A, query);
    const [storages] = useStorages();

    return { paths, storage: storages[WORKSPACE_ADDR_A] };
  };

  const { result } = renderHook(
    () =>
      useTest({
        pathPrefix: '/test',
      }),
    { wrapper }
  );

  expect(result.current.paths).toEqual([]);

  act(() => {
    result.current.storage.set(keypair, {
      format: 'es.4',
      path: '/test/1',
      content: 'Hello!',
    });
  });

  expect(result.current.paths).toEqual(['/test/1']);
});

test('useDocument', () => {
  const { result } = renderHook(
    () => useDocument(WORKSPACE_ADDR_A, '/test/doc'),
    { wrapper }
  );

  expect(result.current[0]).toEqual(undefined);

  act(() => {
    result.current[1]('Hey!');
  });

  expect(result.current[0]?.content).toEqual('Hey!');

  act(() => {
    result.current[2]();
  });

  expect(result.current[0]?.content).toEqual('');
});

test('useSubscribeToStorages', () => {
  const useTest = (options?: {
    workspaces?: string[];
    paths?: string[];
    includeHistory?: boolean;
  }) => {
    const [storages] = useStorages();
    const [state, setState] = React.useState<WriteEvent | null>(null);
    useSubscribeToStorages({ ...options, onWrite: event => setState(event) });

    return { event: state, storages };
  };

  const { result } = renderHook(() => useTest(), { wrapper });

  expect(result.current.event).toEqual(null);

  act(() => {
    result.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Hello!',
      path: '/test/1',
    });
  });

  expect(result.current.event?.document.path).toEqual('/test/1');

  // Can listen for specific workspaces
  const { result: workspaceResult } = renderHook(
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

  expect(workspaceResult.current.event?.document.path).toEqual('/test/2');

  // Can listen for paths
  const { result: pathResult } = renderHook(
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

  expect(workspaceResult.current.event?.document.path).toEqual('/test/b');

  // Can listen for all history
  const { result: historyResult } = renderHook(
    () =>
      useTest({
        includeHistory: true,
      }),
    { wrapper }
  );

  expect(historyResult.current.event).toEqual(null);

  const publishDate = Date.now();

  act(() => {
    historyResult.current.storages[WORKSPACE_ADDR_A].set(keypair, {
      format: 'es.4',
      content: 'Latest!',
      path: '/test/1',
      timestamp: publishDate,
    });
  });

  expect(historyResult.current.event?.document.author).toEqual(keypair.address);

  act(() => {
    historyResult.current.storages[WORKSPACE_ADDR_B].set(otherKeypair, {
      format: 'es.4',
      content: 'Oldest!',
      path: '/test/1',
      timestamp: publishDate - 10000,
    });
  });

  expect(historyResult.current.event?.document.author).toEqual(
    otherKeypair.address
  );
});
