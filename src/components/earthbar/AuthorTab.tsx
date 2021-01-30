import React from 'react';
import { EarthbarTabLabel, EarthbarTab } from './Earthbar';
import UserPanel from './UserPanel';
import NewUserPanel from './NewUserPanel';
import { AuthorLabel } from '../..';
import { useCurrentAuthor } from '../../index';

export default function AuthorTab() {
  const [currentAuthor] = useCurrentAuthor();

  return (
    <EarthbarTab>
      <EarthbarTabLabel data-re-earthbar-author-tab>
        {currentAuthor ? (
          <AuthorLabel address={currentAuthor.address} />
        ) : (
          'Sign in'
        )}
      </EarthbarTabLabel>
      {currentAuthor ? <UserPanel /> : <NewUserPanel />}
    </EarthbarTab>
  );
}
