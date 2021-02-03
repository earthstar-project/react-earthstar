import * as React from 'react';
import { useIsLive } from '../hooks';

export default function SyncingCheckbox() {
  const [isLive, setIsLive] = useIsLive();

  return (
    <div>
      <input
        type={'checkbox'}
        checked={isLive}
        data-re-is-live-checkbox
        id={'react-earthstar-is-live-checkbox'}
        onChange={() => {
          setIsLive(prev => !prev);
        }}
      />
      <label
        data-re-is-live-checkbox-label
        htmlFor={'react-earthstar-is-live-checkbox'}
      >
        {'Syncing'}
      </label>
    </div>
  );
}
