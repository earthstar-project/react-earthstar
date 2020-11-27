import React from 'react';
import { PubEditor, RemoveWorkspaceButton, InvitationCreatorForm } from '..';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@reach/accordion';
import '@reach/accordion/styles.css';

export function WorkspaceOptions({ address }: { address: string }) {
  return (
    <Accordion collapsible multiple>
      <AccordionItem>
        <AccordionButton data-react-earthstar-accordion-button>
          <h2>{'Pubs'}</h2>
        </AccordionButton>
        <AccordionPanel>
          <p>{'Control where this workspace syncs its data to and from.'}</p>

          <PubEditor workspace={address} />
        </AccordionPanel>
      </AccordionItem>
      <hr />
      <AccordionItem>
        <AccordionButton data-react-earthstar-accordion-button>
          <h2>{'Invite others'}</h2>
        </AccordionButton>
        <AccordionPanel>
          <InvitationCreatorForm workspace={address} />
        </AccordionPanel>
      </AccordionItem>
      <hr />
      <AccordionItem>
        <AccordionButton data-react-earthstar-accordion-button>
          <h2>{'Danger Zone'}</h2>
        </AccordionButton>
        <AccordionPanel>
          <p>
            {
              'Your local copy of the workspace will be removed, but will remain with other pubs and peers it has been synced to.'
            }
          </p>
          <RemoveWorkspaceButton workspaceAddress={address} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
