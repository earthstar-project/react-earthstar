/*

WorkspaceLabel

Given a workspace address, returns an element which:
- Displays the workspace name without the hash (so as not to accidentally expose the address to others)
- Ensures the workspace name is displayed with a preceding + sigil (so as to signify it being a workspace)
- Adds a title attribute with the full workspace address (so the user can check the full address if needed)

*/

import * as React from "react";
import { getShareName } from "../util";
import { Identicon } from "./_Identicon";

export function ShareLabel({
  address,
  viewingAuthorSecret,
  iconSize = 10,

  ...props
}:
  & { address: string; iconSize?: number; viewingAuthorSecret?: string }
  & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      title={address}
    >
      {`+${getShareName(address)}`}
      {"\u00A0"}
      <Identicon
        address={address}
        size={iconSize}
        salt={viewingAuthorSecret}
      />
    </span>
  );
}
