import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function CopyAuthorAddressButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <button
      {...props}
      data-re-copy-author-address-button
      data-re-button
      onClick={() =>
        navigator.clipboard.writeText(currentAuthor?.address || '')
      }
      disabled={currentAuthor === null}
    >
      {'Copy author address'}
    </button>
  );
}
