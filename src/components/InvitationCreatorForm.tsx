import React from 'react';
import { useMakeInvitation, useWorkspacePubs } from '..';

export default function InvitationCreatorForm({
  workspaceAddress,
}: {
  workspaceAddress?: string;
}) {
  const [pubs] = useWorkspacePubs(workspaceAddress);
  // include all pubs by default (exclude none)
  const [excludedPubs, setExcludedPubs] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);
  const invitationCode = useMakeInvitation(excludedPubs, workspaceAddress);

  React.useEffect(() => {
    let id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div data-re-invitation-creator-form>
      <input
        data-re-invitation-creator-input
        data-re-input
        value={invitationCode}
        disabled={true}
      />
      <button
        data-re-invitation-creator-button
        data-re-button
        onClick={() => {
          navigator.clipboard.writeText(invitationCode);
          setCopied(true);
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {pubs.length > 0 ? (
        <dl data-re-invitation-creator-pub-options>
          <dt data-re-dt>{'Included pubs'}</dt>
          <dd data-re-dd>
            {pubs.map(pubUrl => (
              <div key={pubUrl}>
                <input
                  data-re-checkbox
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
