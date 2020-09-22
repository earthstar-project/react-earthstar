import React from 'react';

const AUTHOR_NAME_REGEX = /@(.*)\./;

function getAuthorShortname(address: string): string {
  const result = AUTHOR_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

export default function AuthorLabel({ address }: { address: string }) {
  return <span title={address}>{`@${getAuthorShortname(address)}`}</span>;
}
