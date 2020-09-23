import React from 'react';
import { getAuthorShortName } from '../util';

export default function AuthorLabel({ address }: { address: string }) {
  return <span title={address}>{`@${getAuthorShortName(address)}`}</span>;
}
