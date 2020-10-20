import React from 'react';
import { useCurrentAuthor } from '../hooks';
import { useDownloadAuthorKeypair } from '../util';

export default function DownloadKeypairButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  const download = useDownloadAuthorKeypair();

  return (
    <button
      {...props}
      data-react-earthstar-download-keypair-button
      onClick={download}
      disabled={currentAuthor === null}
    >
      {'Download keypair.json'}
    </button>
  );
}
