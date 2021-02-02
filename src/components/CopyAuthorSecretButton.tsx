import * as React from 'react';
import { useCurrentAuthor } from '../hooks';
import CopyButton from './_CopyButton';

export default function CopyAuthorSecretButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <CopyButton
      {...props}
      data-re-copy-author-secret-button
      disabled={currentAuthor === null}
      copyValue={currentAuthor?.secret}
    >
      {'Copy author secret'}
    </CopyButton>
  );
}
