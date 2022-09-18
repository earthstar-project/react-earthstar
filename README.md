# react-earthstar

## What is this?

A library for using React with [Earthstar](https://earthstar-project.org), a library for building syncing, decentralised online tools.

Featuring:

- Don't-have-to-think-about-it realtime collaborative data
- No-servers-involved authentication
- No-distinction-between-the-two offline and online support

## Earthstar

Earthstar models collaborative online tools using the concepts of Shares, Replicas, Documents, and Identities. To learn more about what that all means, check out our [how it works](http://earthstar-project.org/get-started/how-it-works) page.

## Getting started

First, install `react-earthstar` and `earthstar` as dependencies to your project:

```
yarn add earthstar react-earthstar
```

```
npm install earthstar react-earthstar
```

Start by placing the `Peer` component somewhere near the root of your app:

```jsx
import { Peer } from 'react-earthstar';
import { FormatValidatorEs4 } from 'earthstar';
import { ReplicaDriverIndexedDB } from 'earthstar/browser';

function App() {
  return (
    <Peer
      onCreateShare={(address) => {
        // Here we're teaching Peer how to persist data for shares.
        const driver = new ReplicaDriverIndexedDB(address);
        return new Replica(address, FormatValidatorEs4, driver);
      }}
    >
      <h1>{'The beginnings of my app!'}</h1>
      <SomeCoolFeature />
    </Peer>
  );
}
```

`<Peer>`  coordinates the state of your Earthstar app: things like share replicas, the current identity in use, or 

With you app wrapped in `<Peer>`, you now use all of react-earthstar's hooks!

## Hooks

### useReplica

This is the workhorse of the library, used for querying documents from replicas.

```js
const replica = useReplica();

const txtDocs = replica.queryDocs({ filter: { pathEndsWith: '.txt' } });
```

This hook returns an instance of Earthstar's [`ReplicaCache` class](https://doc.deno.land/https://deno.land/x/earthstar@v8.2.4/mod.ts/~/ReplicaCache), with the exact same API.

When you query docs the replica keeps track of what was queried for, and only updates React when the results of those queries are updated. This results in a best-of-both-worlds API where we can have the same API as the vanilla Earthstar library, and components which only re-render when they need to. Nice!

### useCurrentShare

A hook to get and set the active share.

```jsx
const [currentShare, setCurrentShare] = useCurrentShare();

return <div>{`You are currently browsing the docs of ${currentShare}!`}</div>;
```

### useIdentity

A convenience hook for getting and setting an Earthstar identity keypair.

```js
const replica = useReplica();
const [identity, setIdentity] = useIdentity();

const set = () => {
  replica.set(identity, { content: 'Hi!', 'path': '/greetings.txt', format: 'es.4' });
};
```

### usePeer

```js
const peer = usePeer();

const allShares = peer.shares();
```

Returns an instance of Earthstar's [`Peer` class](https://doc.deno.land/https://deno.land/x/earthstar/mod.ts/~/Peer). Useful for getting the list of all shares, adding or removing replicas, etc.

### useIsLive

Get and set whether synchronisation with remote peers is active or not.

```jsx
const [isLive, setIsLive] = useIsLive();

return <label><input checked={isLive} onChange={(e) => { setIsLive(e.target.checked )}} /> Syncing?</label>
```

### useInvitation

Earthstar has a [specification for URL-style invitations](https://github.com/earthstar-project/earthstar/issues/36). This hook parses such URLs and adds any shares or replica servers derived from them.

```jsx
const redeem = useInvitation("earthstar:///?workspace=+gardening.abc&pub=http://pub1.org& v=1");

return <button onClick={() => redeem()}>Join!</button>
```

### useMakeInvitation

You can also create invitations to be used by others:

```js
const invitation = useInvitation(['wss://my.server'], '+gardening.a123');
```

### useAddShare

Adds a share using the `onCreateShare` passed to `<Peer>`:

```js
consnt add = useAddShare();

add('+archery.k456');
```

### useLocalStorageEarthstarSettings

`<Peer>`` holds state which you probably want to persist between sessions. You can use this hook to access this state (written by the `<LocalStorageSettingsWriter/>` component).

```jsx
const settings = useLocalStorageEarthstarSettings('my-app');

return <Peer {...settings} {...etc} />;
```

## Components

There are a few components needed to make things work, as well as a few convenience ones.

### `<Peer>`

You'll need this somewhere in your app to use react-earthstar.

```jsx
<Peer
  onCreateShare={(address) => {
    // Here we're teaching Peer how to persist data for shares.
    const driver = new ReplicaDriverIndexedDB(address);
    return new Replica(address, FormatValidatorEs4, driver);
  }}
>
  <MyGreatAppUsingEarthstar/>
</Peer>
```

`<Peer>` also has a bunch of props for setting its initial state, e.g. `initShares`, `initReplicaServers`, `initIdentity`, etc. These can be hydrated and persisted to local storage using `useEarthstarLocalStorageSettings` and `<LocalStorageSettingsWriter>`.

This component will also automatically start synchronising with any replica servers it knows of.

### `<LocalStorageSettingsWriter>`

Stick this somewhere within `<Peer>` and it'll automatically persist many settings to local storage, namespaced by a key of your choice.

```jsx
<Peer>
  <LocalStorageSettingsWriter storageKey="my-app"/>
</Peer>
```

### `<ShareLabel>`

Renders the human readable portion of a share address, and omits the obscuring portion: e.g. '+gardening.b34ue9ug' becomes '+gardening'. Good for making sure you don't disclose share addresses to people looking over your users' shoulders.

```jsx
<ShareLabel address="+potatoes.b34ou9e8">
```

### `<IdentityLabel>`

Renders the shortname portion of an identity's address, omitting the public key, e.g. `@cinn.euu8euheuigoe...` just becomes `@cinn`.

```jsx
<IdentityLabel address="@devy.a234gue9Juhxo9eu...">
```

### `<CurrentIdentityLabel>`

Does the same as `<IdentityLabel>` but doesn't take an address prop and just uses the current identity provided by `<Peer>`.

## What about Earthbar?

Earthbar was an out-of-the-box UI for managing many Earthstar related tasks. It attempted to pack a lot of functionality and flexibility into this repo, and it was huge. It's been removed from react-earthstar for maintainability reasons, and we will be bringing back something similar in a separate package somewhere down the road.
