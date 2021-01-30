import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function SignOutButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();

  return (
    <button
      {...props}
      data-re-sign-out-button
      data-re-button
      onClick={() => setCurrentAuthor(null)}
      disabled={currentAuthor === null}
    >
      {'Sign out'}
    </button>
  );
}
