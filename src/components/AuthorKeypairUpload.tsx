import React from 'react';
import { checkAuthorKeypairIsValid, isErr } from 'earthstar';
import { useCurrentAuthor } from '../hooks';

type AuthorKeypairUploadProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function AuthorKeypairUpload(props: AuthorKeypairUploadProps) {
  const [, setCurrentAuthor] = useCurrentAuthor();

  return (
    <input
      {...props}
      data-react-earthstar-keypair-upload-input
      type="file"
      accept={'application/json,.keypair.json'}
      onChange={e => {
        if (!e.target.files || e.target.files.length === 0) {
          return;
        }

        const firstFile = e.target.files[0];

        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result;

          if (typeof result !== 'string') {
            alert('Please upload a keypair.json.');
            return;
          }

          const maybeKeypair = JSON.parse(result);

          const validationResult = checkAuthorKeypairIsValid(maybeKeypair);

          if (isErr(validationResult)) {
            alert(validationResult.message);
            return;
          }

          setCurrentAuthor(maybeKeypair);
        };

        reader.readAsText(firstFile);
      }}
    />
  );
}
