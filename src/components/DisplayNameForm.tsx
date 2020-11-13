import React from 'react';
import { useDocument, useCurrentAuthor } from '../hooks';
import { getAuthorShortName } from '../util';

export default function DisplayNameForm({ workspace }: { workspace: string }) {
  const [currentAuthor] = useCurrentAuthor();
  const [displayNameDoc, setDisplayNameDoc] = useDocument(
    workspace,
    `/about/~${currentAuthor?.address}/displayName.txt`
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
      data-react-earthstar-keypair-form
      onSubmit={e => {
        e.preventDefault();
        setNewDisplayName('');
        setDisplayNameDoc(newDisplayName);
      }}
    >
      <label
        data-react-earthstar-display-name-label
        data-react-earthstar-label
        htmlFor={`author-display-name-${workspace}`}
      >
        {'Display name'}
      </label>
      <input
        data-react-earthstar-display-name-input
        data-react-earthstar-input
        value={newDisplayName}
        onChange={e => setNewDisplayName(e.target.value)}
        placeholder={
          displayNameDoc?.content ||
          getAuthorShortName(currentAuthor?.address || '')
        }
      />
      <button
        data-react-earthstar-display-name-button
        data-react-earthstar-button
        type={'submit'}
      >
        {'Set display name'}
      </button>
    </form>
  );
}
