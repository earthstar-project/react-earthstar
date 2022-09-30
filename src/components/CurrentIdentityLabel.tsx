import * as React from "react";

import { IdentityLabel } from "./IdentityLabel";
import {  useKeypair } from "../hooks";

export function CurrentIdentityLabel(
  props: React.HTMLAttributes<HTMLSpanElement>,
) {
  const [currentAuthor] = useKeypair();

  return currentAuthor
    ? <IdentityLabel {...props} address={currentAuthor.address} />
    : <>{"Not signed in"}</>;
}
