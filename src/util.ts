import React from 'react';

const AUTHOR_NAME_REGEX = /@(.*)\./;

export function getAuthorShortName(address: string): string {
  const result = AUTHOR_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

const WORKSPACE_NAME_REGEX = /\+(.*)\./;

export function getWorkspaceName(address: string) {
  const result = WORKSPACE_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

export function useDownload() {
  return React.useCallback((data: any) => {
    const blob = new Blob([JSON.stringify(data)], {
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
  }, []);
}
