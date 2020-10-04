/*

WorkspaceLabel

Given a workspace address, returns an element which:
- Displays the workspace name without the hash (so as not to accidentally expose the address to others)
- Ensures the workspace name is displayed with a preceding + sigil (so as to signify it being a workspace)
- Adds a title attribute with the full workspace address (so the user can check the full address if needed)

*/

import React from 'react';

const WORKSPACE_NAME_REGEX = /\+(.*)\./;

function getWorkspaceName(address: string) {
  const result = WORKSPACE_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

export default function WorkspaceLabel({
  address,
  ...props
}: { address: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      data-react-earthstar-workspace-label
      title={address}
    >{`+${getWorkspaceName(address)}`}</span>
  );
}
