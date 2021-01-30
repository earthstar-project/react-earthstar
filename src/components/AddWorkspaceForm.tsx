import React from 'react';
import { isErr } from 'earthstar';

import { useAddWorkspace, useWorkspacePubs } from '../hooks';

export default function AddWorkspaceForm() {
  const [workspaceAddress, setWorkspaceAddress] = React.useState('');
  const [initialPub, setInitialPub] = React.useState('');

  const add = useAddWorkspace();
  const [, setPubs] = useWorkspacePubs(workspaceAddress);

  return (
    <form
      data-re-add-workspace-form
      onSubmit={e => {
        e.preventDefault();
        const result = add(workspaceAddress);

        if (isErr(result)) {
          return;
        }

        setPubs(prev => [...prev, initialPub]);
      }}
    >
      <label
        data-re-add-workspace-address-label
        data-re-label
        htmlFor={'new-workspace-address'}
      >
        {'Workspace address'}
      </label>
      <input
        data-re-add-workspace-address-input
        data-re-input
        name={'new-workspace-address'}
        placeholder={'+workspace.a123'}
        value={workspaceAddress}
        onChange={e => setWorkspaceAddress(e.target.value)}
      />

      <label
        data-re-add-workspace-pub-label
        data-re-label
        htmlFor={'initial-pub-address'}
      >
        {'Pub address'}
      </label>
      <input
        data-re-add-workspace-pub-input
        data-re-input
        name={'initial-pub-address'}
        placeholder={'https://my.pub/'}
        value={initialPub}
        type="url"
        onChange={e => setInitialPub(e.target.value)}
      />
      <button data-re-add-workspace-button data-re-button type="submit">
        {'Add workspace'}
      </button>
    </form>
  );
}
