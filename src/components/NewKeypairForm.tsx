import React from 'react';
import { generateAuthorKeypair, isErr, AuthorKeypair } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

type NewKeypairFormProps = {
  onSuccess?: (keypair: AuthorKeypair) => void;
};

export default function NewKeypairForm({ onSuccess }: NewKeypairFormProps) {
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

    if (onSuccess) {
      onSuccess(keypair);
    }
  }, [setCurrentAuthor, shortName, currentAuthor, onSuccess]);

  return (
    <form
      data-re-keypair-form
      onSubmit={e => {
        e.preventDefault();

        onCreate();
      }}
    >
      <label
        data-re-keypair-form-shortname-label
        data-re-label
        htmlFor={'short-name-input'}
      >
        Short name
      </label>
      <input
        data-re-keypair-form-shortname-input
        data-re-input
        name={'short-name-input'}
        placeholder={'4-letter nickname'}
        value={shortName}
        onChange={e => setShortName(e.target.value)}
      />
      <button
        data-re-keypair-form-button
        data-re-button
        type={'submit'}
      >
        {'Create'}
      </button>
    </form>
  );
}
