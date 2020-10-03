import React from 'react';
import { checkAuthorKeypairIsValid, isErr } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

export default function AuthorKeypairForm() {
  const [address, setAddress] = React.useState('');
  const [secret, setSecret] = React.useState('');

  const [, setCurrentAuthor] = useCurrentAuthor();

  return (
    <>
      <label react-earthstar-author-form-address-label htmlFor="author-address">
        {'Address'}
      </label>
      <input
        react-earthstar-author-form-address-input
        name="author-address"
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />

      <label react-earthstar-author-form-secret-label htmlFor={'author-secret'}>
        {'Secret'}
      </label>
      <input
        react-earthstar-author-form-secret-input
        name={'author-secret'}
        type="password"
        value={secret}
        onChange={e => setSecret(e.target.value)}
      />

      <button
        react-earthstar-author-form-button
        onClick={() => {
          const keypair = { address, secret };

          const result = checkAuthorKeypairIsValid(keypair);

          if (isErr(result)) {
            alert(result.message);
            return;
          }

          setCurrentAuthor(keypair);
        }}
      >
        {'Sign in'}
      </button>
    </>
  );
}
