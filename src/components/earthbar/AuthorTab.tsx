import React from 'react';
import { EarthbarButton, EarthbarTab } from './Earthbar';
import UserPanel from './UserPanel';
import NewUserPanel from './NewUserPanel';
import { AuthorLabel } from '../..';
import { useCurrentAuthor } from '../../index';

console.log(EarthbarTab, EarthbarButton);

export default function AuthorTab() {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <EarthbarTab>
      <EarthbarButton data-react-earthstar-earthbar-author-tab>
        {currentAuthor ? (
          <AuthorLabel address={currentAuthor.address} />
        ) : (
          'Sign in'
        )}
      </EarthbarButton>
      {currentAuthor ? <UserPanel /> : <NewUserPanel />}
    </EarthbarTab>
  );
}
