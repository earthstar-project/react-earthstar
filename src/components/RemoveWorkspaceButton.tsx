import * as React from 'react';
import { useRemoveWorkspace } from '../hooks';

export default function RemoveWorkspaceButton({
  workspaceAddress,
  children,
  ...props
}: { workspaceAddress: string } & React.HTMLAttributes<HTMLButtonElement>) {
  const remove = useRemoveWorkspace();

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
          remove(workspaceAddress);
        }
      }}
    >
      {`Forget ${workspaceAddress}`}
    </button>
  );
}
