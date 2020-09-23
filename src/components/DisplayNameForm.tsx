import React from 'react';
import { useDocument, useCurrentAuthor } from '../hooks';
import { getAuthorShortName } from '../util';

export default function DisplayNameForm({ workspace }: { workspace: string }) {
  const [currentAuthor] = useCurrentAuthor();
  const [displayNameDoc, setDisplayNameDoc] = useDocument(
    workspace,
    `/about/${currentAuthor?.address}/name`
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
    <>
      <label htmlFor={`author-display-name-${workspace}`}></label>
      <input
        value={newDisplayName}
        onChange={e => setNewDisplayName(e.target.value)}
        placeholder={
          displayNameDoc?.content ||
          getAuthorShortName(currentAuthor?.address || '')
        }
      />
      <button
        onClick={() => {
          setNewDisplayName('');
          setDisplayNameDoc(newDisplayName);
        }}
      >
        {'Set display name'}
      </button>
    </>
  );
}
