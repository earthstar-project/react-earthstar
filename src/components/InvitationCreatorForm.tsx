import * as React from 'react';
import { useMakeInvitation, useWorkspacePubs } from '../hooks';
import CopyButton from './_CopyButton';

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
      <dl data-re-invitation-creator-pub-options>
        <dt data-re-dt>{'Included pubs'}</dt>
        <dd data-re-dd>
          {pubs.map(pubUrl => (
            <div
              data-re-invitation-creator-pub-option
              data-re-pub-item
              key={pubUrl}
            >
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
      <input
        data-re-invitation-creator-input
        data-re-input
        value={invitationCode}
        disabled={true}
      />
      <CopyButton copyValue={invitationCode} />
    </div>
  );
}
