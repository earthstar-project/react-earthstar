import * as React from 'react';
import {
  useCurrentAuthor,
  useCurrentWorkspace,
  useIsLive,
  usePubs,
  useWorkspaces,
} from '../hooks';
import { makeStorageKey } from '../util';

export default function LocalStorageSettingsWriter({
  storageKey,
}: {
  storageKey: string;
}) {
  const lsAuthorKey = makeStorageKey(storageKey, 'current-author');
  const lsPubsKey = makeStorageKey(storageKey, 'pubs');
  const lsWorkspacesKey = makeStorageKey(storageKey, 'workspaces');
  const lsCurrentWorkspaceKey = makeStorageKey(storageKey, 'current-workspace');
  const lsIsLiveKey = makeStorageKey(storageKey, 'is-live');

  const workspaces = useWorkspaces();
  const [pubs] = usePubs();
  const [currentAuthor] = useCurrentAuthor();
  const [currentWorkspace] = useCurrentWorkspace();
  const [isLive] = useIsLive();

  React.useEffect(() => {
    localStorage.setItem(lsWorkspacesKey, JSON.stringify(workspaces));
  });

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
