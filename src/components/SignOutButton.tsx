import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function SignOutButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();

  return (
    <button
      {...props}
      data-react-earthstar-sign-out-button
      data-react-earthstar-button
      onClick={() => setCurrentAuthor(null)}
      disabled={currentAuthor === null}
    >
      {'Sign out'}
    </button>
  );
}
