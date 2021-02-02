import * as React from 'react';
import WorkspaceLabel from './WorkspaceLabel';
import { useDocument, useCurrentAuthor } from '../hooks';
import { getAuthorShortName } from '../util';

export default function DisplayNameForm({
  workspaceAddress,
}: {
  workspaceAddress?: string;
}) {
  const [currentAuthor] = useCurrentAuthor();
  const [displayNameDoc, setDisplayNameDoc] = useDocument(
    `/about/~${currentAuthor?.address}/displayName.txt`,
    workspaceAddress
  );

  const [newDisplayName, setNewDisplayName] = React.useState(
    displayNameDoc?.content || ''
  );

  if (!currentAuthor) {
    return (
      <>{"You can't change your display name because you're not signed in."}</>
    );
  }

  return (
    <form
      data-re-keypair-form
      onSubmit={e => {
        e.preventDefault();
        setNewDisplayName('');
        setDisplayNameDoc(newDisplayName);
      }}
    >
      <label
        data-re-display-name-label
        data-re-label
        htmlFor={`author-display-name-${workspaceAddress}`}
      >
        {'Your display name in '}
        <WorkspaceLabel address={workspaceAddress || 'nowhere'} />
      </label>
      <input
        data-re-display-name-input
        data-re-input
        value={newDisplayName}
        onChange={e => setNewDisplayName(e.target.value)}
        placeholder={
          displayNameDoc?.content ||
          getAuthorShortName(currentAuthor?.address || '')
        }
      />
      <button data-re-display-name-button data-re-button type={'submit'}>
        {'Set display name'}
      </button>
    </form>
  );
}
