import React from 'react';
import { isErr } from 'earthstar';
import Alert from '@reach/alert';
import {
  useInvitation,
  useWorkspaces,
  usePubs,
  useCurrentWorkspace,
} from '../hooks';
import { WorkspaceLabel } from '../components';

export default function InvitationRedemptionForm({
  onRedeem,
}: {
  onRedeem?: (workspace: string, pubs: string[]) => void;
}) {
  const workspaces = useWorkspaces();
  const [pubs] = usePubs();
  const [, setCurrentWorkspace] = useCurrentWorkspace();
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
    <>
      <form
        data-re-invitatiton-redemption-form
        onSubmit={e => {
          e.preventDefault();

          if (!isErr(result)) {
            const { workspace, pubs } = result;
            result.redeem(excludedPubs);
            if (onRedeem) {
              onRedeem(
                workspace,
                pubs.filter(pubUrl => !excludedPubs.includes(pubUrl))
              );
            }
            setCode('');
            setUncheckedPubs([]);
            setCurrentWorkspace(workspace);
          }
        }}
      >
        <label data-re-invitation-code-label data-re-label>
          {'Paste invitation code'}
        </label>
        <input
          data-re-invitation-code-input
          data-re-input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={'earthstar:///?workspace=...'}
        />
        {isErr(result) && code.length > 0 ? (
          <Alert data-re-invitation-code-alert>{result.message}</Alert>
        ) : null}
        {!isErr(result) ? (
          <fieldset data-re-fieldset>
            <legend data-re-legend>{'Invitation Details'}</legend>
            <dl data-re-invitation-description key={'invitation-description'}>
              <dt data-re-dt>{'Workspace'}</dt>
              <dd data-re-dd>
                <span data-re-workspace-item>{result.workspace}</span>
                {workspaces.includes(result.workspace)
                  ? ' (already added)'
                  : null}
              </dd>
              <dt data-re-dt>{'Pubs'}</dt>
              <dd data-re-dd>
                {result.pubs.length > 0
                  ? result.pubs.map(pubUrl => (
                      <div data-re-invitation-redemption-pub-list-item>
                        <span data-re-pub-item key={pubUrl}>
                          <input
                            data-re-checkbox
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
                        </span>
                      </div>
                    ))
                  : 'No pubs will be added'}
              </dd>
            </dl>
          </fieldset>
        ) : null}
        {code.length > 0 ? (
          <button
            key={'redeem-button'}
            data-re-invitation-redemption-button
            data-re-button
            type={'submit'}
            disabled={isThereAnythingToAdd === false}
          >
            {getButtonLabel()}
          </button>
        ) : null}
      </form>
      <details data-re-details key={'help-where-to-get'}>
        <summary data-re-summary>
          {'Where can I get an invitation code?'}
        </summary>
        <div data-re-details-content>
          <p>
            Ask an existing member to make an invitation code from the workspace
            settings page.
          </p>
        </div>
      </details>
    </>
  );
}
