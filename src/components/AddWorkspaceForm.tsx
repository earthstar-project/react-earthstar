import React from 'react';
import { isErr } from 'earthstar';

import { useAddWorkspace, usePubs } from '../hooks';

export default function AddWorkspaceForm() {
  const [workspaceAddress, setWorkspaceAddress] = React.useState('');
  const [initialPub, setInitialPub] = React.useState('');

  const add = useAddWorkspace();
  const [, setPubs] = usePubs(workspaceAddress);

  return (
    <div>
      <label htmlFor={'new-workspace-address'}>{'Workspace address'}</label>
      <input
        name={'new-workspace-address'}
        value={workspaceAddress}
        onChange={e => setWorkspaceAddress(e.target.value)}
      />

      <label htmlFor={'initial-pub-address'}>{'Pub address'}</label>
      <input
        name={'initial-pub-address'}
        value={initialPub}
        type="url"
        onChange={e => setInitialPub(e.target.value)}
      />
      <button
        onClick={() => {
          const result = add(workspaceAddress);

          if (isErr(result)) {
            return;
          }

          setPubs(prev => [...prev, initialPub]);
        }}
      >
        {'Add workspace'}
      </button>
    </div>
  );
}
