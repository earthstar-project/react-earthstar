import React from 'react';
import { ValidatorEs4, StorageMemory } from 'earthstar';
import { renderHook } from '@testing-library/react-hooks';
import { EarthstarPeer, useWorkspaces } from '../src';

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
    <EarthstarPeer initWorkspaces={storages} initPubs={pubs}>
      {children}
    </EarthstarPeer>
  );
};

test('useWorkspace returns workspaces', () => {
  const { result } = renderHook(() => useWorkspaces(), { wrapper });

  expect(result.current).toEqual([
    WORKSPACE_ADDR_A,
    WORKSPACE_ADDR_B,
    WORKSPACE_ADDR_C,
  ]);
});
