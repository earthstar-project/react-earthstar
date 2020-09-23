import React from 'react';
import { useCurrentAuthor } from '../hooks';

export default function DownloadKeypairButton() {
  const [currentAuthor] = useCurrentAuthor();

  const download = React.useCallback(() => {
    if (!currentAuthor) {
      return;
    }

    const blob = new Blob([JSON.stringify(currentAuthor)], {
      type: 'octet/stream',
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = 'keypair.json';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [currentAuthor]);

  return (
    <button onClick={download} disabled={currentAuthor === null}>
      {'Download keypair.json'}
    </button>
  );
}
