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

  const onWrite = React.useCallback(() => {
    const storagesStringified = JSON.stringify(
      Object.values(storages).reduce((acc, storage) => {
        const { _docs } = storage as StorageMemory;

        return { ...acc, [storage.workspace]: _docs };
      }, {})
    );

    localStorage.setItem(lsStoragesKey, storagesStringified);
  }, [storages, lsStoragesKey]);

  // Persist workspace docs on storage events
  useSubscribeToStorages({
    onWrite,
  });

  // Persist workspace docs when onWrite's value changes
  React.useEffect(() => {
    onWrite();
  }, [onWrite]);

  React.useEffect(() => {
    localStorage.setItem(lsPubsKey, JSON.stringify(pubs));
  }, [pubs, lsPubsKey]);

  React.useEffect(() => {
    localStorage.setItem(lsAuthorKey, JSON.stringify(currentAuthor));
  }, [currentAuthor, lsAuthorKey]);

  React.useEffect(() => {
    localStorage.setItem(
      lsCurrentWorkspaceKey,
      JSON.stringify(currentWorkspace)
    );
  }, [currentWorkspace, lsCurrentWorkspaceKey]);

  React.useEffect(() => {
    localStorage.setItem(lsIsLiveKey, JSON.stringify(isLive));
  });

  return null;
}
