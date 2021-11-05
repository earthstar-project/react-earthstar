import * as React from 'react';
import {
  AuthorKeypair,
  isErr,
  EarthstarError,
  Crypto,
  StorageAsync,
  StorageDriverAsyncMemory,
  FormatValidatorEs4
} from 'stone-soup';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  EarthstarPeer,
  useWorkspacePubs,
  usePubs,
  useCurrentWorkspace,
  useInvitation,
  useMakeInvitation,
  LocalStorageSettingsWriter,
  useLocalStorageEarthstarSettings,
  useStorage,
} from '../src';

const keypair = Crypto.generateAuthorKeypair('onee') as AuthorKeypair;

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
        return new StorageAsync(workspaceAddress, FormatValidatorEs4, new StorageDriverAsyncMemory(workspaceAddress))
      }}
    >
      {children}
      <LocalStorageSettingsWriter storageKey={'tests'} />
    </EarthstarPeer>
  );
};

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

test('useStorage', async () => {
  
  
  
  const { result, waitForNextUpdate } = renderHook(() => useStorage(), {
    wrapper,
  });

  expect(result.current.getAllDocs()).toEqual([]);

  act(() => {
    result.current.set(keypair, {
      path: '/storage-test/test.txt',
      format: 'es.4',
      content: 'Hello world!',
    });
  });
  
  await waitForNextUpdate()

  expect(result.current.getLatestDocAtPath('/storage-test/test.txt')?.content).toEqual(
    'Hello world!'
  );

  expect(result.current.getAllDocs().length).toEqual(1);

  const query = { filter : {pathStartsWith: `/storage-test`} };

  expect(result.current.queryDocs(query)).toEqual([]);

  await waitForNextUpdate();

  expect(result.current.queryDocs(query)[0].content).toEqual('Hello world!');
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
