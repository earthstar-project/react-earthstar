import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox';
import React from 'react';
import { usePubs, useWorkspacePubs } from '../hooks';

export default function PubEditor({
  workspaceAddress,
}: {
  workspaceAddress?: string;
}) {
  const [pubToAdd, setPubToAdd] = React.useState('');
  const [pubs, setPubs] = useWorkspacePubs(workspaceAddress);

  const removePub = React.useCallback(
    (pubToRemove: string) => {
      setPubs(prev => prev.filter(pub => pub !== pubToRemove));
    },
    [setPubs]
  );

  const addPub = React.useCallback(
    (pubToAdd: string) => {
      setPubToAdd('');
      setPubs(prev => [...prev, pubToAdd]);
    },
    [setPubs, setPubToAdd]
  );

  const [totalPubs] = usePubs();
  const allPubs = Array.from(new Set(Object.values(totalPubs).flat()));
  const selectablePubs = allPubs.filter(pubUrl => !pubs.includes(pubUrl));

  return (
    <>
      {pubs.length > 0 ? (
        <ul data-react-earthstar-pubeditor-list>
          {pubs.map(pubUrl => {
            return (
              <li data-react-earthstar-pubeditor-list-item key={`${pubUrl}`}>
                <a href={pubUrl}>{pubUrl}</a>
                <button
                  data-react-earthstar-pubeditor-list-item-delete-button
                  data-react-earthstar-button
                  onClick={() => removePub(pubUrl)}
                >
                  {'Remove pub'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <form
        data-react-earthstar-pubeditor-add-form
        onSubmit={e => {
          e.preventDefault();
          if (pubToAdd.length > 0) {
            addPub(pubToAdd);
          }
        }}
      >
        <label
          data-react-earthstar-pubeditor-newpub-label
          data-react-earthstar-label
          htmlFor={'pub-to-add'}
        >
          {'Pub URL'}
        </label>
        <Combobox
          openOnFocus
          onSelect={item => addPub(item)}
          data-react-earthstar-pubeditor-newpub-input
          data-react-earthstar-input
        >
          <ComboboxInput
            selectOnClick
            value={pubToAdd}
            onChange={e => setPubToAdd(e.target.value)}
          />
          {selectablePubs.length > 0 ? (
            <ComboboxPopover>
              <ComboboxList>
                {selectablePubs.map(pubUrl => (
                  <ComboboxOption
                    data-react-earthstar-option
                    key={pubUrl}
                    value={pubUrl}
                  >
                    {pubUrl}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            </ComboboxPopover>
          ) : null}
        </Combobox>
        <button
          data-react-earthstar-pubeditor-add-button
          data-react-earthstar-button
          type={'submit'}
        >
          {'Add pub'}
        </button>
      </form>
    </>
  );
}
