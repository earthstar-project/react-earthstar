import React from 'react';

import AuthorLabel from './AuthorLabel';
import { useCurrentAuthor } from '../hooks';

export default function CurrentAuthor() {
  const [currentAuthor] = useCurrentAuthor();

  return currentAuthor ? (
    <AuthorLabel address={currentAuthor.address} />
  ) : (
    <>{'Not signed in'}</>
  );
}
