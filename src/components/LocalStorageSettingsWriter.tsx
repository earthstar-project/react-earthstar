import { writeStorage } from '@rehooks/local-storage';
import { StorageMemory } from 'earthstar';
import * as React from 'react';
import {
  useCurrentAuthor,
  useCurrentWorkspace,
  useIsLive,
  usePubs,
  useStorages,
  useSubscribeToStorages,
} from '../hooks';
import { makeStorageKey } from '../util';

export default function LocalStorageSettingsWriter({
  storageKey,
}: {
  storageKey: string;
}) {
  const lsAuthorKey = makeStorageKey(storageKey, 'current-author');
  const lsPubsKey = makeStorageKey(storageKey, 'pubs');
  const lsStoragesKey = makeStorageKey(storageKey, 'storages');
  const lsCurrentWorkspaceKey = makeStorageKey(storageKey, 'current-workspace');
  const lsIsLiveKey = makeStorageKey(storageKey, 'is-live');

  const [storages] = useStorages();
  const [pubs] = usePubs();
  const [currentAuthor] = useCurrentAuthor();
  const [currentWorkspace] = useCurrentWorkspace();
  const [isLive] = useIsLive();

  useSubscribeToStorages({
    onWrite: event => {
      const storage = storages[event.document.workspace];
      writeStorage(lsStoragesKey, {
        ...storages,
        [event.document.workspace]: (storage as StorageMemory)._docs,
      });
    },
  });

  React.useEffect(() => {
    Object.values(storages).forEach(storage => {
      writeStorage(lsStoragesKey, {
        ...storages,
        [storage.workspace]: (storage as StorageMemory)._docs,
      });
    });
  }, [storages, lsStoragesKey]);

  React.useEffect(() => {
    writeStorage(lsPubsKey, pubs);
  }, [pubs, lsPubsKey]);

  React.useEffect(() => {
    writeStorage(lsAuthorKey, currentAuthor);
  }, [currentAuthor, lsAuthorKey]);

  React.useEffect(() => {
    writeStorage(lsCurrentWorkspaceKey, currentWorkspace);
  }, [currentWorkspace, lsCurrentWorkspaceKey]);

  React.useEffect(() => {
    writeStorage(lsIsLiveKey, isLive);
  });

  return null;
}
