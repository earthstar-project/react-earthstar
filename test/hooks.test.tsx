import * as React from 'react';
import {
  ValidatorEs4,
  StorageMemory,
  generateAuthorKeypair,
  AuthorKeypair,
  isErr,
  EarthstarError,
  sleep,
  StorageToAsync,
} from 'earthstar';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  EarthstarPeer,
  useWorkspaces,
  useAddWorkspace,
  useRemoveWorkspace,
  useWorkspacePubs,
  usePubs,
  useStorages,
  useCurrentWorkspace,
  useInvitation,
  useMakeInvitation,
  LocalStorageSettingsWriter,
  useLocalStorageEarthstarSettings,
  useWorkspaceStorage,
} from '../src';
import StorageMemoryCache from '../src/StorageMemoryCache';

const keypair = generateAuthorKeypair('onee') as AuthorKeypair;

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

test('useWorkspaceStorage', async () => {
  const { result } = renderHook(() => useWorkspaceStorage(), {
    wrapper,
  });

  expect(result.current.documents()).toEqual([]);

  act(() => {
    result.current.set(keypair, {
      path: '/storage-test/test.txt',
      format: 'es.4',
      content: 'Hello world!',
    });
  });

  expect(result.current.getContent('/storage-test/test.txt')).toEqual(
    'Hello world!'
  );

  expect(result.current.documents().length).toEqual(1);

  const query = { pathStartsWith: `/storage-test` };

  expect(result.current.documents(query)).toEqual([]);

  //await waitForNextUpdate();

  expect(result.current.documents(query).length).toEqual(1);
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
