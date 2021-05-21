import * as React from 'react';
import { isErr } from 'stone-soup';
import { useCurrentAuthor, useStorage } from '../hooks';
import WorkspaceLabel from './WorkspaceLabel';

export default function DeleteMyDataForm(props: { workspaceAddress: string }) {
  const [currentAuthor] = useCurrentAuthor();
  const storage = useStorage(props.workspaceAddress);

  const canDelete = storage && currentAuthor;

  const [prompt, setPrompt] = React.useState('');
  const promptMatches = prompt === 'DELETE EVERYTHING';

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
    <form data-re-form data-re-delete-my-data-form>
      <label data-re-label data-re-delete-my-data-label>
        {'Please type '}
        <b>{'DELETE EVERYTHING '}</b>
        {'to confirm'}
      </label>
      <input
        data-re-input
        data-re-delete-my-data-input
        disabled={deleted}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        data-re-button
        data-re-delete-my-data-button
        onClick={async () => {
          if (!storage || !currentAuthor) {
            return;
          }

          const shouldDelete = window.confirm(
            `This will delete all your data from ${props.workspaceAddress}. Are you sure you want to do this?`
          );

          if (!shouldDelete) {
            return;
          }

          const numDeleted = await storage._storage.overwriteAllDocsByAuthor(
            currentAuthor
          );

          if (isErr(numDeleted)) {
            setDeleted(false);
            alert('Something went wrong!');
            return;
          }

          setNumberDeleted(numDeleted);
          setDeleted(true);
          setPrompt('');
        }}
        disabled={!canDelete || deleted || !promptMatches}
      >
        {deleted ? (
          `Deleted ${numberDeleted} data documents`
        ) : canDelete ? (
          <>
            {'Delete my data from '}
            <WorkspaceLabel address={props.workspaceAddress} />
          </>
        ) : (
          'Delete my data in this workspace'
        )}
      </button>
      {!canDelete ? (
        <div data-re-error-note>
          {!currentAuthor
            ? 'You are not signed in.'
            : 'No workspace specified.'}
        </div>
      ) : null}
    </form>
  );
}
