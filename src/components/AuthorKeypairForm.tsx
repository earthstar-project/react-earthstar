import React from 'react';
import { checkAuthorKeypairIsValid, isErr } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

export default function AuthorKeypairForm() {
  const [address, setAddress] = React.useState('');
  const [secret, setSecret] = React.useState('');

  const [, setCurrentAuthor] = useCurrentAuthor();

  return (
    <form
      data-react-earthstar-author-keypair-form
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
        data-react-earthstar-author-form-address-label
        htmlFor="author-address"
      >
        {'Address'}
      </label>
      <input
        data-react-earthstar-author-form-address-input
        name="author-address"
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />

      <label
        data-react-earthstar-author-form-secret-label
        htmlFor={'author-secret'}
      >
        {'Secret'}
      </label>
      <input
        data-react-earthstar-author-form-secret-input
        name={'author-secret'}
        type="password"
        value={secret}
        onChange={e => setSecret(e.target.value)}
      />

      <button data-react-earthstar-author-form-button type={'submit'}>
        {'Sign in'}
      </button>
    </form>
  );
}
