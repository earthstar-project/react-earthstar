import React from 'react';
import { useCurrentAuthor } from '../hooks';
import CopyButton from './_CopyButton';

export default function CopyAuthorAddressButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <CopyButton
      {...props}
      data-re-copy-author-address-button
      disabled={currentAuthor === null}
      copyValue={currentAuthor?.address}
    >
      {'Copy author address'}
    </CopyButton>
  );
}
