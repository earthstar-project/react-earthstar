import * as React from 'react';
import Guidance from './_Guidance';

export function CanITellMyIdentity() {
  return (
    <Guidance title={'Can I tell other people my identity?'}>
      <p>
        {
          "It's safe to tell friends your author <b>address</b> -- the whole long thing."
        }
      </p>
      <p>
        {
          "Since anyone can make an address with the same nickname as you, telling people your entire address will help them know they're not talking to an impostor."
        }
      </p>
      <p>
        {"Don't share your "}
        <b>{'secret'}</b>
        {' — treat it like a password.'}
      </p>
    </Guidance>
  );
}

export function HowDoIdentitiesWork() {
  return (
    <Guidance title={'How do identities work under the hood?'}>
      <p>
        {
          'Your address is a cryptographic public key, and your secret is the corresponding private key.'
        }
      </p>
      <p>
        {
          'Your data is signed, but not encrypted, with this keypair. Anyone can in the workspace can read it, but nobody can alter it or the signature would become invalid.'
        }
      </p>
      <p>
        {'Earthstar uses '}
        <a href="https://github.com/earthstar-project/earthstar/blob/master/docs/specification.md#ed25519-signatures">
          {'ed25519 keypairs encoded in base32.'}
        </a>
      </p>
      <p>
        {
          "The 4-character nickname is not part of the keypair but is considered part of your distinct identity. You can make multiple identities with the same keypair and different nicknames and they will be considered different identities. Here's more about "
        }
        <a href="https://github.com/earthstar-project/earthstar/blob/master/docs/specification.md#faq-author-shortnames">
          {'the reasoning behind this design.'}
        </a>
      </p>
    </Guidance>
  );
}

export function CanIChangeMyNickname() {
  return (
    <Guidance title={'Can I change my nickname later?'}>
      {' '}
      <p>
        {'No, but after you sign in you can set a '}
        <b>{'display name'}</b>
        {' which you can change whenever you like.'}
      </p>
    </Guidance>
  );
}

export function CanIResetMySecret() {
  return (
    <Guidance title={'I lost my secret, can I reset it?'}>
      <p>
        {
          'Unfortunately not! Your public address and secret are tied together, and neither can be changed after creation.'
        }
      </p>
      <p>
        {
          "If you've lost your secret, the best thing to to do is create a new identity and tell your friends about it."
        }
      </p>
    </Guidance>
  );
}

export function WhatIsAnAuthorIdentity() {
  return (
    <Guidance title={'What is an author identity?'}>
      <p>
        {"It's like a user account. You can write data to workspaces with it."}
      </p>
      <p>
        {'It has a public '}
        <b>{'address'}</b>
        {
          ' made of a 4 letter nickname plus a cryptographic public key, and a cryptographic '
        }
        <b>{'secret'}</b>
        {" that's similar to a password."}
      </p>
      <p>
        {
          'You can have many identities, or use a single one across many workspaces.'
        }
      </p>
    </Guidance>
  );
}

export function WhatIsAPub() {
  return (
    <Guidance title={'What are pub servers?'}>
      <p>
        {
          "Pub servers run in the cloud and hold a copy of the workspace data. They help keep the data online so it can sync even when some people's devices are turned off."
        }
      </p>
      <p>
        {
          'One workspace can use several pub servers; each will hold a complete redundant copy of the data. You can add more pubs whenever you like.'
        }
      </p>
    </Guidance>
  );
}

export function WhatIsAWorkspace() {
  return (
    <Guidance title={'What is a workspace?'}>
      <p>
        {
          'Think of a workspace as a shareable folder. It has an address (e.g. +cooking.z95uf), and whoever knows the address can read and write data in that folder.'
        }
      </p>
      <p>
        {
          'You can join or create as many workspaces as you want. A single workspace can be used by many different apps.'
        }
      </p>
      <p>
        {
          "Workspaces' data are stored on pub servers and in your browser's storage on your own computer."
        }
      </p>
    </Guidance>
  );
}

export function WhatWillCreateWorkspaceFormDo() {
  return (
    <Guidance title={'What will this form do?'}>
      <p>
        {
          "  A new workspace will be made on your device, and it will be synced with the pub servers given above. If you don't add any pub servers, your data will only exist on your own device. You can add pub servers later."
        }
      </p>
    </Guidance>
  );
}

export function WhereToFindPubServers() {
  return (
    <Guidance title={'Where do I find pub servers?'}>
      <p>
        {'Ask your friends, or run your own using '}
        <a href="https://github.com/earthstar-project/earthstar-pub#running-on-glitch">
          {'these instructions.'}
        </a>
      </p>
      <p>
        {
          "Pub servers can see your data, so it's best to use ones run by people you know and trust."
        }
      </p>
    </Guidance>
  );
}

export function WhereToGetInvitationCode() {
  return (
    <Guidance title={'Where can I get an invitation code?'}>
      <p>
        Ask an existing member to make an invitation code from the workspace
        settings page.
      </p>
    </Guidance>
  );
}

export function WhoCanJoinMyWorkspace() {
  return (
    <Guidance title={'Who will be able to join my workspace?'}>
      <p>
        {
          'Anyone who knows a workspace address, and at least one of its pubs, can join it. They will be able to read and write data.'
        }
      </p>
      <p>
        {
          ' After creating your workspace, you can get an invitation code to send to your friends from the workspace settings page.'
        }
      </p>
      <p>
        {
          'Your workspace can also be joined by whoever is running the pubs it syncs with.'
        }
      </p>
    </Guidance>
  );
}

export function WhyDoINeedToSaveMyIdentity() {
  return (
    <Guidance title={"'Why do I need to save my identity?'"}>
      <p>
        {
          'Your identity is not stored on any servers, so if you lose access to it there is no way to retrieve it.'
        }
      </p>
      <p>{'Should this happen, you will need to generate a new identity.'}</p>
      <p>
        {
          'We recommend storing your author address and secret, or keypair.json, in a password manager.'
        }
      </p>
    </Guidance>
  );
}
