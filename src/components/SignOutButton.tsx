import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function SignOutButton() {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();

  return (
    <button
      onClick={() => setCurrentAuthor(null)}
      disabled={currentAuthor === null}
    >
      {'Sign out'}
    </button>
  );
}
