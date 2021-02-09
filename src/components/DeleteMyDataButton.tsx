import { deleteMyDocuments } from 'earthstar';
import * as React from 'react';
import { useCurrentAuthor, useStorage } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function DeleteMyDataButton(
  props: {
    workspaceAddress: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [currentAuthor] = useCurrentAuthor();
  const storage = useStorage(props.workspaceAddress);

  const canDelete = storage && currentAuthor;

  const [deleted, setDeleted] = React.useState(false);
  const [numberDeleted, setNumberDeleted] = React.useState<
    number | undefined
  >();

  React.useEffect(() => {
    const id = setTimeout(() => {
      setDeleted(false);
      setNumberDeleted(undefined);
    }, 3000);
    return () => clearTimeout(id);
  }, [deleted]);

  return (
    <>
      <button
        {...props}
        data-re-button
        data-re-delete-my-data-button
        onClick={() => {
          if (!storage || !currentAuthor) {
            return;
          }

          const shouldDelete = window.confirm(
            `This will delete all your documents from ${props.workspaceAddress}. Are you sure you want to do this?`
          );

          if (!shouldDelete) {
            return;
          }

          const { numDeleted } = deleteMyDocuments(storage, currentAuthor);

          setNumberDeleted(numDeleted);
          setDeleted(true);
        }}
        disabled={!canDelete || deleted}
      >
        {deleted ? (
          `Deleted ${numberDeleted} documents`
        ) : canDelete ? (
          <>
            {'Delete my documents from '}
            <WorkspaceLabel address={props.workspaceAddress} />
          </>
        ) : (
          'Delete my documents'
        )}
      </button>
      {!canDelete ? (
        <div data-re-error-note>
          {!currentAuthor
            ? 'You are not signed in.'
            : 'No workspace specified.'}
        </div>
      ) : null}
    </>
  );
}
