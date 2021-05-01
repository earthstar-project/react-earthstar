import * as React from 'react';
import { checkAuthorIsValid, isErr } from 'stone-soup';
import { useCurrentAuthor } from '../hooks';

type AuthorKeypairUploadProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function AuthorKeypairUpload(props: AuthorKeypairUploadProps) {
  const [, setCurrentAuthor] = useCurrentAuthor();

  const labelRef = React.useRef<HTMLLabelElement | null>(null);

  return (
    <>
      <input
        {...props}
        data-re-keypair-upload-input
        type="file"
        accept={'application/json,.keypair.json'}
        id={'keypair-upload-button'}
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

            const validationResult = checkAuthorIsValid(maybeKeypair.address);

            if (isErr(validationResult)) {
              alert(validationResult.message);
              return;
            }

            setCurrentAuthor(maybeKeypair);
          };

          reader.readAsText(firstFile);
        }}
      />
      <label
        ref={labelRef}
        data-re-keypair-upload-label
        data-re-label
        htmlFor={'keypair-upload-button'}
      >
        <button
          data-re-keypair-upload-button
          data-re-button
          onClick={() => {
            if (labelRef.current) {
              labelRef.current.click();
            }
          }}
        >
          {'Sign in with keypair.json file'}
        </button>
      </label>
    </>
  );
}
