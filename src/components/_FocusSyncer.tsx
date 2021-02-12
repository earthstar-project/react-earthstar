import * as React from 'react';
import { useIsLive, useStorages, useSync } from '../hooks';

export default function FocusSyncer() {
  const [isLive] = useIsLive();
  const [storages] = useStorages();
  const sync = useSync();

  const onFocus = React.useCallback(() => {
    if (!isLive) {
      return;
    }

    Object.keys(storages).forEach(address => {
      console.log(`syncing ${address} on focus...`);
      sync(address);
    });
  }, [sync, storages, isLive]);

  React.useEffect(() => {
    window.addEventListener('visibilitychange', onFocus, false);
    window.addEventListener('focus', onFocus, false);

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  });

  return null;
}
