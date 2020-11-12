import React from 'react';
import { isErr } from 'earthstar';
import Alert from '@reach/alert';
import { useInvitation, useWorkspaces, usePubs } from '../hooks';
import { WorkspaceLabel } from '../components';

export default function InvitationRedemptionForm() {
  const workspaces = useWorkspaces();
  const [pubs] = usePubs();
  const [code, setCode] = React.useState('');
  const result = useInvitation(code);

  const [uncheckedPubs, setUncheckedPubs] = React.useState<string[]>([]);

  const preexistingPubs = isErr(result) ? [] : pubs[result.workspace] || [];

  const excludedPubs = Array.from(
    new Set([...uncheckedPubs, ...preexistingPubs])
  );

  const isThereAnythingToAdd = isErr(result)
    ? false
    : !workspaces.includes(result.workspace) ||
      result.pubs.length - excludedPubs.length > 0;

  const getButtonLabel = () => {
    if (isErr(result)) {
      return 'Add workspace';
    }

    const pubCount = result.pubs.length - excludedPubs.length;

    if (workspaces.includes(result.workspace)) {
      return (
        <>
          {`Add ${pubCount <= 0 ? 'no' : pubCount} pub${
            pubCount !== 1 ? 's' : ''
          } to `}
          <WorkspaceLabel address={result.workspace} />
        </>
      );
    }

    const pubsSuffix =
      pubCount <= 0
        ? ' with no pubs'
        : ` and ${pubCount} pub${pubCount > 1 ? 's' : ''}`;

    return (
      <>
        {'Add '}
        <WorkspaceLabel address={result.workspace} />
        {`${pubsSuffix}`}
      </>
    );
  };

  return (
    <form
      data-react-earthstar-invitatiton-redemption-form
      onSubmit={e => {
        e.preventDefault();

        if (!isErr(result)) {
          result.redeem(excludedPubs);
          setCode('');
          setUncheckedPubs([]);
        }
      }}
    >
      <label
        data-react-earthstar-invitation-code-label
        data-react-earthstar-label
      >
        {'Redeem invitation code'}
      </label>
      <input
        data-react-earthstar-invitation-code-input
        data-react-earthstar-input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder={'earthstar:///?workspace=...'}
      />
      {isErr(result) && code.length > 0 ? (
        <Alert data-react-earthstar-invitation-code-alert>
          {result.message}
        </Alert>
      ) : null}
      {!isErr(result) ? (
        <dl data-react-earthstar-invitation-description>
          <dt data-react-earthstar-dt>{'Workspace'}</dt>
          <dd data-react-earthstar-dd>
            {result.workspace}
            {workspaces.includes(result.workspace) ? ' (already added)' : null}
          </dd>
          <dt data-react-earthstar-dt>{'Pubs'}</dt>
          <dd data-react-earthstar-dd>
            {result.pubs.length > 0
              ? result.pubs.map(pubUrl => (
                  <div key={pubUrl}>
                    <input
                      data-react-earthstar-checkbox
                      id={`react-earthstar-invitation-${pubUrl}-option`}
                      type="checkbox"
                      disabled={preexistingPubs.includes(pubUrl)}
                      checked={
                        !excludedPubs.includes(pubUrl) ||
                        preexistingPubs.includes(pubUrl)
                      }
                      onChange={() => {
                        if (preexistingPubs.includes(pubUrl)) {
                          return;
                        }

                        const isExcluded = excludedPubs.includes(pubUrl);

                        if (isExcluded) {
                          return setUncheckedPubs(pubs =>
                            pubs.filter(url => url !== pubUrl)
                          );
                        }

                        setUncheckedPubs(pubs => [...pubs, pubUrl]);
                      }}
                    />
                    <label
                      htmlFor={`react-earthstar-invitation-${pubUrl}-option`}
                    >
                      {pubUrl}
                      {pubs[result.workspace]?.includes(pubUrl)
                        ? ' (already added)'
                        : null}
                    </label>
                  </div>
                ))
              : 'No pubs will be added'}
          </dd>
        </dl>
      ) : null}
      {code.length > 0 ? (
        <button
          data-react-earthstar-invitation-redemption-button
          data-react-earthstar-button
          type={'submit'}
          disabled={isThereAnythingToAdd === false}
        >
          {getButtonLabel()}
        </button>
      ) : null}
    </form>
  );
}
