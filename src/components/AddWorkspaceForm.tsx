import React from 'react';
import { isErr } from 'earthstar';

import { useAddWorkspace, useWorkspacePubs } from '../hooks';

export default function AddWorkspaceForm() {
  const [workspaceAddress, setWorkspaceAddress] = React.useState('');
  const [initialPub, setInitialPub] = React.useState('');

  const add = useAddWorkspace();
  const [, setPubs] = useWorkspacePubs(workspaceAddress);

  return (
    <div data-react-earthstar-add-workspace-form>
      <label
        data-react-earthstar-add-workspace-address-label
        htmlFor={'new-workspace-address'}
      >
        {'Workspace address'}
      </label>
      <input
        data-react-earthstar-add-workspace-address-input
        name={'new-workspace-address'}
        placeholder={'+workspace.a123'}
        value={workspaceAddress}
        onChange={e => setWorkspaceAddress(e.target.value)}
      />

      <label
        data-react-earthstar-add-workspace-pub-label
        htmlFor={'initial-pub-address'}
      >
        {'Pub address'}
      </label>
      <input
        data-react-earthstar-add-workspace-pub-input
        name={'initial-pub-address'}
        placeholder={'https://my.pub/'}
        value={initialPub}
        type="url"
        onChange={e => setInitialPub(e.target.value)}
      />
      <button
        data-react-earthstar-add-workspace-button
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
