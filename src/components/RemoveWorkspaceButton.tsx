import React from 'react';
import { useCurrentWorkspace, useRemoveWorkspace } from '../hooks';

export default function RemoveWorkspaceButton({
  workspaceAddress,
  children,
  ...props
}: { workspaceAddress?: string } & React.HTMLAttributes<HTMLButtonElement>) {
  const remove = useRemoveWorkspace();
  const [currentWorkspace] = useCurrentWorkspace();

  const address = workspaceAddress || currentWorkspace;

  return (
    <button
      data-re-remove-workspace-button
      data-re-button
      {...props}
      onClick={event => {
        if (!address) {
          return;
        }

        const isSure = window.confirm(
          `Are you sure you want to remove ${address} from your workspaces?`
        );

        if (isSure && props.onClick) {
          props.onClick(event);
        }

        if (isSure) {
          remove(address);
        }
      }}
    >
      {children || `Remove ${address}`}
    </button>
  );
}
