import * as React from "react";

import { IdentityLabel } from "./IdentityLabel";
import { useIdentity } from "../hooks";

export function CurrentIdentityLabel(
  props: React.HTMLAttributes<HTMLSpanElement>,
) {
  const [currentAuthor] = useIdentity();

  return currentAuthor
    ? <IdentityLabel {...props} address={currentAuthor.address} />
    : <>{"Not signed in"}</>;
}
