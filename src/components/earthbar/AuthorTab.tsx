import * as React from 'react';
import UserPanel from './UserPanel';
import NewUserPanel from './NewUserPanel';
import AuthorLabel from '../AuthorLabel';
import { useCurrentAuthor } from '../../hooks';
import EarthbarTab from './EarthbarTab';
import EarthbarTabLabel from './EarthbarTabLabel';

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
