import React from 'react';
import { useDocument, useCurrentAuthor } from '../hooks';

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
    return "You can't change your display name because you're not signed in.";
  }

  return (
    <>
      <label htmlFor={`author-display-name-${workspace}`}></label>
      <input
        value={newDisplayName}
        onChange={e => setNewDisplayName(e.target.value)}
      />
      <button onClick={() => setDisplayNameDoc(newDisplayName)}>
        {'Set display name'}
      </button>
    </>
  );
}
