import React from 'react';
import { useCurrentAuthor } from '../hooks';
import { useDownload } from '../util';

export default function DownloadKeypairButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();

  const download = useDownload();

  return (
    <button
      {...props}
      data-re-download-keypair-button
      data-re-button
      onClick={() => download(currentAuthor)}
      disabled={currentAuthor === null}
    >
      {'Download keypair.json'}
    </button>
  );
}
