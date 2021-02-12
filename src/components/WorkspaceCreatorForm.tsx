import * as React from 'react';
import { ValidatorEs4, isErr } from 'earthstar';
import { useAddWorkspace, useCurrentWorkspace, usePubs } from '../hooks';
import { Alert } from '@reach/alert';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import {
  WhatIsAPub,
  WhatIsAWorkspace,
  WhatWillCreateWorkspaceFormDo,
  WhereToFindPubServers,
  WhoCanJoinMyWorkspace,
} from './guidance/guidances';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';

function randomFromString(str: string) {
  return str[Math.floor(Math.random() * str.length)];
}

function generateSuffix() {
  const firstLetter = randomFromString(LETTERS);
  const rest = Array.from(Array(11), () =>
    randomFromString(LETTERS + NUMBERS)
  ).join('');

  return `${firstLetter}${rest}`;
}

export default function WorkspaceCreatorForm({
  onCreate,
}: {
  onCreate?: (workspace: string) => void;
}) {
  const [pubs, setPubs] = usePubs();
  const add = useAddWorkspace();

  const [workspaceName, setWorkspaceName] = React.useState('');
  const [workspaceSuffix, setWorkspaceSuffix] = React.useState(generateSuffix);
  const address = `+${workspaceName}.${workspaceSuffix}`;
  const validResult = ValidatorEs4._checkWorkspaceIsValid(address);
  const isValid = !isErr(validResult);

  const allPubs = Array.from(new Set(Object.values(pubs).flat()));
  const [addedPubs, setAddedPubs] = React.useState<string[]>([]);
  const selectablePubs = allPubs.filter(pubUrl => !addedPubs.includes(pubUrl));
  const [, setCurrentWorkspace] = useCurrentWorkspace();

  const [pubToAdd, setPubToAdd] = React.useState('');

  return (
    <>
      <form
        data-re-workspace-creator-form
        id={'react-earthstar-address-form'}
        onSubmit={e => {
          e.preventDefault();

          add(address);
          setWorkspaceName('');
          setWorkspaceSuffix(generateSuffix());

          setPubs(prev => ({
            ...prev,
            [address]: addedPubs,
          }));

          setAddedPubs([]);

          if (onCreate) {
            onCreate(address);
          }

          setCurrentWorkspace(address);
        }}
      >
        <fieldset data-re-fieldset>
          <legend data-re-legend>
            {
              'Workspace address with identifiable name and hard-to-guess suffix'
            }
          </legend>
          <span data-re-workspace-address-fields>
            <span data-re-workspace-sigil>{'+'}</span>
            <input
              data-re-input
              data-re-workspace-name-input
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder={'myworkspace'}
            />
            <span data-re-workspace-separator-dot>{'.'}</span>
            <span data-re-workspace-suffix>{workspaceSuffix}</span>
            <button
              data-re-regenerate-suffix-button
              onClick={e => {
                e.preventDefault();
                setWorkspaceSuffix(generateSuffix());
              }}
            >
              {'↻'}
            </button>
          </span>

          {isErr(validResult) && workspaceName.length > 0 ? (
            <Alert data-re->{validResult.message}</Alert>
          ) : null}
        </fieldset>
        <div data-re-workspace-creator-initial-pubs-fieldset>
          <legend data-re-legend>{'Pub servers to sync with'}</legend>
          <ul data-re-pubs-list>
            {addedPubs.map(pubUrl => (
              <li data-re-pubs-list-item key={pubUrl}>
                <span data-re-pub-item>
                  {pubUrl}
                  <button
                    data-re-button
                    data-re-pub-item-remove-button
                    onClick={() => {
                      setAddedPubs(prev => prev.filter(url => url !== pubUrl));
                    }}
                  >
                    {'✕'}
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <Combobox
            data-re-combobox
            data-re-workspace-creator-pub-input
            openOnFocus
            onSelect={item => setAddedPubs(prev => [...prev, item])}
          >
            <ComboboxInput
              data-re-combobox-input
              selectOnClick
              value={pubToAdd}
              onChange={e => setPubToAdd(e.target.value)}
              placeholder={'https://my.pub'}
            />
            {selectablePubs.length > 0 ? (
              <ComboboxPopover data-re-combobox-popover>
                <ComboboxList data-re-combobox-list>
                  {selectablePubs.map(pubUrl => (
                    <ComboboxOption
                      data-re-combobox-option
                      key={pubUrl}
                      value={pubUrl}
                    >
                      <span data-re-pub-item>{pubUrl}</span>
                    </ComboboxOption>
                  ))}
                </ComboboxList>
              </ComboboxPopover>
            ) : null}
          </Combobox>
          <button
            data-re-button
            data-re-workspace-creator-pub-add-button
            disabled={pubToAdd.length === 0}
            onClick={e => {
              e.preventDefault();
              setPubToAdd('');
              setAddedPubs(prev => [...prev, pubToAdd]);
            }}
          >
            {'Add pub'}
          </button>
        </div>
        {isValid ? (
          <button
            data-re-button
            data-re-workspace-creator-submit
            disabled={!isValid}
            type={'submit'}
          >
            {`Create ${address}`}
          </button>
        ) : null}
      </form>
      <WhatIsAWorkspace />
      <WhatWillCreateWorkspaceFormDo />
      <WhatIsAPub />
      <WhereToFindPubServers />
      <WhoCanJoinMyWorkspace />
    </>
  );
}
