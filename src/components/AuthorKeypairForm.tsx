import React from 'react';
import { checkAuthorKeypairIsValid, isErr } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

export default function AuthorKeypairForm() {
  const [address, setAddress] = React.useState('');
  const [secret, setSecret] = React.useState('');

  const [, setCurrentAuthor] = useCurrentAuthor();

  return (
    <form
      data-re-author-keypair-form
      onSubmit={e => {
        e.preventDefault();

        const keypair = { address, secret };

        const result = checkAuthorKeypairIsValid(keypair);

        if (isErr(result)) {
          alert(result.message);
          return;
        }

        setCurrentAuthor(keypair);
      }}
    >
      <label
        data-re-author-form-address-label
        data-re-label
        htmlFor="author-address"
      >
        {'Author Address'}
      </label>
      <input
        data-re-author-form-address-input
        data-re-input
        name="author-address"
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <label
        data-re-author-form-secret-label
        data-re-label
        htmlFor={'author-secret'}
      >
        {'Secret'}
      </label>
      <input
        data-re-author-form-secret-input
        data-re-input
        name={'author-secret'}
        type="password"
        value={secret}
        onChange={e => setSecret(e.target.value)}
      />

      <button
        data-re-author-form-button
        data-re-button
        type={'submit'}
      >
        {'Sign in'}
      </button>
    </form>
  );
}
