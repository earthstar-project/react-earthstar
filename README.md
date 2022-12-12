# react-earthstar

## What is this?

A library of React hooks and components for usage with
[Earthstar](https://earthstar-project.org), storage for private, distributed,
offline-first application.

This library is just a few small hooks for subscribing to some events in
Earthstar, with the same API for querying and writing data.

It's recommended that you check out Earthstar's
[README](https://github.com/earthstar-project/earthstar) before reading on if
you haven't already.

## Getting started

First, install `react-earthstar` and `earthstar` as dependencies to your
project:

```
npm install earthstar react-earthstar
```

Here's a basic applet which creates a IndexedDB replica for a `+gardening`
share, and renders a list of notes using `useReplica`.

```jsx
import * as Earthstar from "earthstar";
import { useReplica } from 'react-earthstar';

// You get the share address and secret from someone else,
// Or using Earthstar.Crypto.generateShareKeypair()

const MY_SHARE_ADDRESS =
  "+gardening.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq";

const MY_SHARE_SECRET = "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q";

const replica = new Earthstar.Replica({
  driver: new ReplicaDriverWeb(MY_SHARE_ADDRESS),
  shareSecret: MY_SHARE_SECRET,
});

function App() {
  const cache = useReplica(replica);

  // This will update whenever a document with a path starting with '/notes' updates.
  const notes = cache.queryDocs({
    filter: {
      pathStartsWith: "/notes",
      author: 
    },
  });

  return (
    <div>
      <h1>My notes</h1>
      { notes.map((noteDoc) => 
        <li>noteDoc.text</li>
      )}
      
    </div>
  );
}
```

## Hooks

### `useReplica`

This is the workhorse of the library, used for querying documents from replicas.

```js
const replica = useReplica(myReplica);

const txtDocs = replica.queryDocs({ filter: { pathEndsWith: ".txt" } });
```

This hook returns an instance of Earthstar's
[`ReplicaCache` class](https://doc.deno.land/https://deno.land/x/earthstar@v10.0.0-beta.8/mod.ts/~/ReplicaCache),
with the exact same API as `Replica` except synchronous.

When you query docs the replica keeps track of what was queried for, and only
updates React when the results of those queries are updated. This results in a
best-of-both-worlds API where we can have the same API as the vanilla Earthstar
library, and components which only re-render when they need to. Nice!

### `usePeerReplicas`

Returns an updating array of `Replica` for a given `Peer`.

```js
function ReplicaList() {
  const replicas = usePeerReplicas(myPeer);

  return (
    <div>
      <h1>My replicas</h1>
      <ul>
        {replicas.map((replica) => <li>{replica.share}</li>)}
      </ul>
    </div>
  );
}
```

### `useAuthorSettings`

Returns a getter and setter for the `ClientSettings`' current author setting.
Uses the `ClientSettingsContext`.

```js
function CurrentAuthorAddress() {
  const [author, setAuthor] = useAuthorSettings();

  return <div>{author.address}</div>;
}
```

### `useShareSettings`

Returns the shares + a callback to add a share + a callback to remove a share
from `ClientSettings`' shares setting. Uses the `ClientSettingsContext`.

```js
function KnownShares() {
  const [shares, addShare, removeShare] = useAuthorSettings();

  return (
    <div>
      <h1>My shares</h1>
      <ul>
        {shares.map((share) => <li>{share}</li>)}
      </ul>
    </div>
  );
}
```

### `useShareSecretSettings`

Returns the secrets + a callback to add a secret + a callback to remove a secret
from `ClientSettings`' share secrets setting. Uses the `ClientSettingsContext`.

```js
function KnownSecrets() {
  const [secrets, addSecret, removeSecret] = useAuthorSettings();

  return (
    <div>
      <h1>Known secrets...p</h1>
      <ul>
        {Object.keys(secrets).map((share) => (
          <li>{share} {secrets["share"] ? "✓" : "???"}</li>
        ))}
      </ul>
    </div>
  );
}
```

### `useServerSettings`

Returns the server + a callback to add a server + a callback to remove a server
from `ClientSettings`' servers setting. Uses the `ClientSettingsContext`.

```js
function KnownShares() {
  const [servers, addServer, removeServer] = useAuthorSettings();

  return (
    <div>
      <h1>My servers</h1>
      <ul>
        {servers.map((share) => <li>{server}</li>)}
      </ul>
    </div>
  );
}
```

## Components

### `<ClientSettingsContext.Provider>`

If you're going to use any of the settings hooks, you should provide a single
instance of `ClientSettings` as a context for them:

```js
const settings = new Earthstar.ClientSettings();

function App() {
  return (
    <ClientSettings.Provider value={settings}>
      // Components which use useAuthorSettings, useShareSettings etc.
      <TheRestOfTheApp />
    </ClientSettings.Provider>
  );
}
```

### `<ShareLabel>`

Renders the human readable portion of a share address, and omits the public key:
e.g. '+gardening.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq' becomes
'+gardening'. Also renders an identicon next to the address to make it harder
for shares to be mistaken for one another. Good for making sure you don't
disclose share addresses to people looking over your users' shoulders.

```jsx
<ShareLabel address="+potatoes.b34ou9e8">
```

Also takes an `iconSize` prop (side size in `px`), and a `viewingAuthorSecret`
prop. The latter prop is used as a salt for generating the identicon, making it
so that each user has their own identicon for each share, making them harder for
an attacker to imitate. If available, pass the current user's keypair secret to
this prop.

### `<IdentityLabel>`

Renders the shortname portion of an identity's address, omitting the public key,
e.g. `@cinn.euu8euheuigoe...` just becomes `@cinn`.

```jsx
<IdentityLabel address="@devy.a234gue9Juhxo9eu...">
```

Also takes an `iconSize` prop (side size in `px`), and a `viewingAuthorSecret`
prop. The latter prop is used as a salt for generating the identicon, making it
so that each user has their own identicon for each share, making them harder for
an attacker to imitate. If available, pass the current user's keypair secret to
this prop.
