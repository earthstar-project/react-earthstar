import * as React from 'react';

import { useIsLive, useSync, uses } from '../hooks';

export default function FocusSyncer() {
  const [isLive] = useIsLive();
  const [storages] = useStorages();
  const sync = useSync();

  const onFocus = React.useCallback(() => {
    if (!isLive) {
      return;
    }

    Object.keys(storages).forEach(address => {
      sync(address);
    });
  }, [sync, storages, isLive]);

  React.useEffect(() => {
    window.addEventListener('focus', onFocus, false);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [onFocus]);

  return null;
}
