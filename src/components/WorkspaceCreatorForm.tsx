import React from 'react';
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
import { EarthbarContext } from './earthbar/Earthbar';

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

  const { setActiveIndex, setFocusedIndex } = React.useContext(EarthbarContext);

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
          setFocusedIndex(-1);
          setActiveIndex(-1);
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
      <details data-re-details>
        <summary data-re-summary>{'What will this form do?'}</summary>
        <div data-re-details-content>
          <p>
            A new workspace will be made on your device, and it will be synced
            with the pub servers given above. If you don't add any pub servers,
            your data will only exist on your own device. You can add pub
            servers later.
          </p>
        </div>
      </details>
      <details data-re-details>
        <summary data-re-summary>{'What are pub servers?'}</summary>
        <div data-re-details-content>
          <p>
            Pub servers run in the cloud and hold a copy of the workspace data.
            They help keep the data online so it can sync even when some
            people's devices are turned off.
          </p>
          <p>
            One workspace can use several pub servers; each will hold a complete
            redundant copy of the data. You can add more pubs whenever you like.
          </p>
        </div>
      </details>
      <details data-re-details>
        <summary data-re-summary>{'Where do I find pub servers?'}</summary>
        <div data-re-details-content>
          <p>
            Ask your friends, or run your own using{' '}
            <a href="https://github.com/earthstar-project/earthstar-pub#running-on-glitch">
              these instructions.
            </a>
          </p>
          <p>
            Pub servers can see your data, so it's best to use ones run by
            people you know and trust.
          </p>
        </div>
      </details>
      <details data-re-details>
        <summary data-re-summary>
          {'Who will be able to join my workspace?'}
        </summary>
        <div data-re-details-content>
          <p>
            Anyone who knows a workspace address, and at least one of its pubs,
            can join it. They will be able to read and write data.
          </p>
          <p>
            After creating your workspace, you can get an invitation code to
            send to your friends from the workspace settings page.
          </p>
          <p>
            Your workspace can also be joined by whoever is running the pubs it
            syncs with.
          </p>
        </div>
      </details>
    </>
  );
}
