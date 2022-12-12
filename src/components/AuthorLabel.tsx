import * as React from "react";
import { getAuthorShortName } from "../util";
import { Identicon } from "./_Identicon";

export function AuthorLabel({
  address,
  viewingAuthorSecret,
  iconSize = 10,

  ...props
}:
  & {
    address: string;
    iconSize?: number;
    viewingAuthorSecret?: string;
  }
  & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      title={address}
    >
      {`@${getAuthorShortName(address)}`}
      {"\u00A0"}
      <Identicon
        address={address}
        size={iconSize}
        salt={viewingAuthorSecret}
      />
    </span>
  );
}
