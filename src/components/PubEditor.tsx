import React from 'react';
import { usePubs } from '../hooks';

export default function PubEditor({ workspace }: { workspace: string }) {
  const [pubToAdd, setPubToAdd] = React.useState('');
  const [pubs, setPubs] = usePubs(workspace);

  const removePub = React.useCallback((pubToRemove: string) => {
    setPubs(prev => prev.filter(pub => pub !== pubToRemove));
  }, []);

  const addPub = React.useCallback((pubToAdd: string) => {
    setPubToAdd('');
    setPubs(prev => [...prev, pubToAdd]);
  }, []);

  return (
    <>
      {pubs.length > 0 ? (
        <ul>
          {pubs.map(pubUrl => {
            return (
              <li key={`${pubUrl}`}>
                {pubUrl}
                <button onClick={() => removePub(pubUrl)}>
                  {'Remove pub'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <label htmlFor={'pub-to-add'}>{'Pub URL'}</label>
      <input
        type="url"
        name={'pub-to-add'}
        value={pubToAdd}
        onChange={e => setPubToAdd(e.target.value)}
        placeholder={'https://my.pub/'}
      />
      <button
        onClick={() => {
          if (pubToAdd.length > 0) {
            addPub(pubToAdd);
          }
          
        }}
      >
        {'Add new pub'}
      </button>
    </>
  );
}
