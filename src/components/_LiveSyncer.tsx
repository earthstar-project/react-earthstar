//import * as React from 'react';
//import { OnePubOneWorkspaceSyncer } from 'earthstar';
//import { useIsLive, useStorages, useWorkspacePubs } from '../hooks';

// TODO: There is no live syncing API for IStorageAsync yet

export default function LiveSyncer({}: { workspaceAddress: string }) {
  /*
  const [isLive] = useIsLive();
  const [storages] = useStorages();
  const [pubs] = useWorkspacePubs(workspaceAddress);

  
  React.useEffect(() => {
    const syncers = pubs.map(
      pubUrl => new OnePubOneWorkspaceSyncer(storages[workspaceAddress], pubUrl)
    );

    if (!isLive) {
      syncers.forEach(syncer => {
        syncer.stopPushStream();
        syncer.stopPullStream();
      });
    } else {
      // Start streaming when isLive changes to true
      syncers.forEach(syncer => {
        syncer.syncOnceAndContinueLive();
      });
    }

    // On cleanup (unmount, value of syncers changes) stop all syncers from pulling and pushing
    return () => {
      syncers.forEach(syncer => {
        syncer.stopPullStream();
        syncer.stopPushStream();
      });
    };
  }, [pubs, isLive, workspaceAddress, storages]);
  */

  return null;
}
