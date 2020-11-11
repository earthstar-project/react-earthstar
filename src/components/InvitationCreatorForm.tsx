import React from 'react';
import { useMakeInvitation, useWorkspacePubs, WorkspaceLabel } from '..';

export default function InvitationCreatorForm({
  workspace,
}: {
  workspace: string;
}) {
  const [pubs] = useWorkspacePubs(workspace);
  const [excludedPubs, setExcludedPubs] = React.useState(pubs);
  const [copied, setCopied] = React.useState(false);
  const invitationCode = useMakeInvitation(workspace, excludedPubs);

  React.useEffect(() => {
    let id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div data-react-earthstar-invitation-creator-form>
      <input
        data-react-earthstar-invitation-creator-input
        data-react-earthstar-input
        value={invitationCode}
        disabled={true}
      />
      <button
        data-react-earthstar-invitation-creator-button
        data-react-earthstar-button
        onClick={() => {
          navigator.clipboard.writeText(invitationCode);
          setCopied(true);
        }}
      >
        {copied ? (
          'Copied!'
        ) : (
          <>
            {'Copy invitation code for '}
            <WorkspaceLabel address={workspace} />
          </>
        )}
      </button>
      {pubs.length > 0 ? (
        <dl data-react-earthstar-invitation-creator-pub-options>
          <dt data-react-earthstar-dt>{'Included pubs'}</dt>
          <dd data-react-earthstar-dd>
            {pubs.map(pubUrl => (
              <div key={pubUrl}>
                <input
                  data-react-earthstar-checkbox
                  id={`react-earthstar-invitation-${pubUrl}-option`}
                  type="checkbox"
                  checked={!excludedPubs.includes(pubUrl)}
                  onChange={() => {
                    const isExcluded = excludedPubs.includes(pubUrl);

                    if (isExcluded) {
                      return setExcludedPubs(pubs =>
                        pubs.filter(url => url !== pubUrl)
                      );
                    }

                    setExcludedPubs(pubs => [...pubs, pubUrl]);
                  }}
                />
                <label htmlFor={`react-earthstar-invitation-${pubUrl}-option`}>
                  {pubUrl}
                </label>
              </div>
            ))}
          </dd>
        </dl>
      ) : null}
    </div>
  );
}
