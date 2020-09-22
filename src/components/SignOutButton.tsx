import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function SignOutButton() {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();

  return currentAuthor ? (
    <button onClick={() => setCurrentAuthor(null)}>{'Sign out'}</button>
  ) : null;
}
