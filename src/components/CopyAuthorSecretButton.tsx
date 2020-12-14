import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function CopyAuthorSecretButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <button
      {...props}
      data-react-earthstar-copy-author-secret-button
      data-react-earthstar-button
      onClick={() => navigator.clipboard.writeText(currentAuthor?.secret || '')}
      disabled={currentAuthor === null}
    >
      {'Copy author secret'}
    </button>
  );
}
