import React from 'react';
import { generateAuthorKeypair, isErr } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

export default function NewKeypairForm() {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();
  const [shortName, setShortName] = React.useState('');

  const onCreate = React.useCallback(() => {
    const keypair = generateAuthorKeypair(shortName);

    if (isErr(keypair)) {
      alert(keypair.message);
      return;
    }

    if (currentAuthor) {
      const res = window.confirm(
        'This will replace the currently signed in author. Proceed?'
      );

      if (!res) {
        return;
      }
    }

    setShortName('');
    setCurrentAuthor(keypair);
  }, [setCurrentAuthor, shortName, currentAuthor]);

  return (
    <>
      <label
        react-earthstar-keypair-form-shortname-label
        htmlFor={'short-name-input'}
      >
        Short name
      </label>
      <input
        react-earthstar-keypair-form-shortname-input
        name={'short-name-input'}
        placeholder={'4-letter nickname'}
        value={shortName}
        onChange={e => setShortName(e.target.value)}
      />
      <button react-earthstar-keypair-form-button onClick={onCreate}>
        {'Create'}
      </button>
    </>
  );
}
