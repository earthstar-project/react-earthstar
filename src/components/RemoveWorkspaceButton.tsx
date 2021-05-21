import * as React from 'react';
import { usePeer } from '../hooks';

export default function RemoveWorkspaceButton({
  workspaceAddress,
  children,
  ...props
}: { workspaceAddress: string } & React.HTMLAttributes<HTMLButtonElement>) {
  const peer = usePeer();

  return (
    <button
      data-re-remove-workspace-button
      data-re-button
      {...props}
      onClick={event => {
        const isSure = window.confirm(
          `Are you sure you want to remove ${workspaceAddress} from your workspaces?`
        );

        if (isSure && props.onClick) {
          props.onClick(event);
        }

        if (isSure) {
          peer.removeStorageByWorkspace(workspaceAddress);
        }
      }}
    >
      {`Forget ${workspaceAddress}`}
    </button>
  );
}
