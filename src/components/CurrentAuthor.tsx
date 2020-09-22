import React from 'react';

import { useCurrentAuthor } from '../hooks';

export default function CurrentAuthor() {
  const [currentAuthor] = useCurrentAuthor();

  return <div>{currentAuthor ? currentAuthor.address : 'Not signed in'}</div>;
}
