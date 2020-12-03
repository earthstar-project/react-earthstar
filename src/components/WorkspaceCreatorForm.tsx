import React from 'react';
import { ValidatorEs4, isErr } from 'earthstar';
import { useAddWorkspace, usePubs } from '../hooks';
import { Alert } from '@reach/alert';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';

function randomFromString(str: string) {
  return str[Math.floor(Math.random() * str.length)];
}

function generateSuffix() {
  const firstLetter = randomFromString(LETTERS);
  const rest = Array.from(Array(10), () =>
    randomFromString(LETTERS + NUMBERS)
  ).join('');

  return `${firstLetter}${rest}`;
}

export default function WorkspaceCreatorForm() {
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

  const [pubToAdd, setPubToAdd] = React.useState('');

  return (
    <form
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
      }}
    >
      <fieldset data-react-earthstar-fieldset>
        <legend data-react-earthstar-legend>{'Address'}</legend>
        <span>{'+'}</span>
        <input
          react-earthstar-input
          value={workspaceName}
          onChange={e => setWorkspaceName(e.target.value)}
          placeholder={'myworkspace'}
        />
        <span>{'.'}</span>
        <input
          react-earthstar-input
          value={workspaceSuffix}
          onChange={e => setWorkspaceSuffix(e.target.value)}
        />
        {isErr(validResult) && workspaceName.length > 0 ? (
          <Alert data-react-earthstar->{validResult.message}</Alert>
        ) : null}
      </fieldset>

      <fieldset data-react-earthstar-fieldset>
        <legend data-react-earthstar-legend>{'Initial Pubs'}</legend>
        {addedPubs.map(pubUrl => (
          <li key={pubUrl}>
            <a href={pubUrl}>{pubUrl}</a>
            <button
              react-earthstar-button
              onClick={() => {
                setAddedPubs(prev => prev.filter(url => url !== pubUrl));
              }}
            >
              {'Remove'}
            </button>
          </li>
        ))}
        <Combobox
          openOnFocus
          onSelect={item => setAddedPubs(prev => [...prev, item])}
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
          <button
            onClick={e => {
              e.preventDefault();
              setPubToAdd('');
              setAddedPubs(prev => [...prev, pubToAdd]);
            }}
          >
            {'Add'}
          </button>
        </Combobox>
      </fieldset>

      <button react-earthstar-button disabled={!isValid} type={'submit'}>
        {!isValid ? 'Add workspace' : `Add ${address}`}
      </button>
    </form>
  );
}
