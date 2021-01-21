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
        <ul data-re-pubeditor-list>
          {pubs.map(pubUrl => {
            return (
              <li data-re-pubeditor-list-item key={`${pubUrl}`}>
                <a href={pubUrl}>{pubUrl}</a>
                <button
                  data-re-pubeditor-list-item-delete-button
                  data-re-button
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
        data-re-pubeditor-add-form
        onSubmit={e => {
          e.preventDefault();
          if (pubToAdd.length > 0) {
            addPub(pubToAdd);
          }
        }}
      >
        <label
          data-re-pubeditor-newpub-label
          data-re-label
          htmlFor={'pub-to-add'}
        >
          {'Pub URL'}
        </label>
        <Combobox
          openOnFocus
          onSelect={item => addPub(item)}
          data-re-pubeditor-newpub-input
          data-re-input
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
                    data-re-option
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
          data-re-pubeditor-add-button
          data-re-button
          type={'submit'}
        >
          {'Add pub'}
        </button>
      </form>
    </>
  );
}
