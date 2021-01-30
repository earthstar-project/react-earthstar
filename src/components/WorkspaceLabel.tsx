/*

WorkspaceLabel

Given a workspace address, returns an element which:
- Displays the workspace name without the hash (so as not to accidentally expose the address to others)
- Ensures the workspace name is displayed with a preceding + sigil (so as to signify it being a workspace)
- Adds a title attribute with the full workspace address (so the user can check the full address if needed)

*/

import React from 'react';
import { getWorkspaceName } from '../util';

export default function WorkspaceLabel({
  address,
  ...props
}: { address: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      data-re-workspace-label
      title={address}
    >{`+${getWorkspaceName(address)}`}</span>
  );
}
