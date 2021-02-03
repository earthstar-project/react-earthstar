import * as React from 'react';
import { getAuthorShortName } from '../util';

export default function AuthorLabel({
  address,
  ...props
}: { address: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      data-re-author-label
      title={address}
    >{`@${getAuthorShortName(address)}`}</span>
  );
}
