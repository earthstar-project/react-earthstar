import * as React from "react";
import { getAuthorShortName } from "../util";

export function IdentityLabel({
  address,
  ...props
}: { address: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      title={address}
    >
      {`@${getAuthorShortName(address)}`}
    </span>
  );
}
