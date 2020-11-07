import React from 'react';
import { useRemoveWorkspace } from '../hooks';

export default function RemoveWorkspaceButton({
  workspaceAddress,
  children,
  ...props
}: { workspaceAddress: string } & React.HTMLAttributes<HTMLButtonElement>) {
  const remove = useRemoveWorkspace();

  return (
    <button
      data-react-earthstar-remove-workspace-button
      data-react-earthstar-button
      {...props}
      onClick={() => {
        const isSure = window.confirm(
          `Are you sure you want to remove ${workspaceAddress} from your workspaces?`
        );

        if (isSure) {
          remove(workspaceAddress);
        }
      }}
    >
      {children || `Remove ${workspaceAddress}`}
    </button>
  );
}
