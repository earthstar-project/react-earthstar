import React from 'react';
import { useCurrentAuthor } from './hooks';

const AUTHOR_NAME_REGEX = /@(.*)\./;

export function getAuthorShortName(address: string): string {
  const result = AUTHOR_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

export function useDownloadAuthorKeypair() {
  const [currentAuthor] = useCurrentAuthor();

  return React.useCallback(() => {
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
}
