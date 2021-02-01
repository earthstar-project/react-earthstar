# react-earthstar

## What is this?

react-earthstar is a UI toolkit for making collaborative, offline-first applets for small groups. Your applet's data is stored with the peers who use it, and on infrastructure you own or trust.

- App examples here! Wikis! Chatrooms! More concrete, small group-y things!

No monthly payments, API keys, or complicated user authentication!

This is made possible by the Earthstar protocol.

## What's Earthstar?

We all want apps where we can look at and change data together: stuff like documents, events, or messages.

But where is all that kept? And who do we trust it with?

Earthstar is **on offline-first, distributed, syncable, embedded document database for use in p2p software — in browsers and outside of browsers**.

Earthstar's model is: **Workspaces** store **Documents**, which are written and edited by **Authors**. Workspaces' data are propagated by **Pub Servers**.

### Workspaces

It's like a shared folder for a small group of people. You could have separate workspaces for your family, your D&D party, or book club. A workspace stores many documents.

### Documents

Documents are stored at paths like `/wiki/gardening/cabbage.txt` They can store any data which can be represented as a UTF-8 string, and their contents can be edited and deleted. They can have editing permissions. They can even be set to automatically delete themselves after a period of time.

### Authors

Authors are identities used for writing and editing documents. They have a public address and a secret, which are used together to cryptographically prove an author is who they say they are. You can have one or many.

### Pubs

While peers _could_ sync data directly to one another, with small groups there's a decent chance no-one else is online when you are. Pubs are little mini-servers used to sync workspace data with peers. They have no special authority over data. They are designed to be very easy to run.

## So what's react-earthstar again?

This package offers several layers of convenience around Earthstar: React hooks for writing and reading data from workspaces, pre-made components for common tasks, and even a full-blown control centre that does all the table-stakes stuff for you.

## Getting started

First, install `react-earthstar` and `earthstar` as dependencies to your project:

```
yarn add earthstar react-earthstar
```

```
npm install earthstar react-earthstar
```

Start by placing the `EarthstarPeer` component somewhere near the root of your app:

```jsx
import { EarthstarPeer } from 'react-earthstar';

function App() {
  return (
    <EarthstarPeer>
      <h1>{'The beginnings of my app!'}</h1>
      <SomeCoolFeature />
    </EarthstarPeer>
  );
}
```

Under the hood, `EarthstarPeer` coordinates the state of your Earthstar app: things like the current user, known workspaces, or whether syncing is active or not.

With `EarthstarPeer` wrapped around your app, you're ready to go.

## Build your app

Click below for learning about these with their own docs

- [EarthstarPeer](docs/earthstarpeer.md) - Learn more about configuring <EarthstarPeer>
- [Hooks](docs/hooks.md) - Learn how to access and write data and app state with hooks
- [Earthbar](docs/earthbar.md) - Pre-made, customisable control center for common earthstar tasks — learn how to customise and style it here
- [Components](docs/components.md) - Pre-made UIs to make your life easy! - learn what's available and how to style here
- [Styling](docs/styling.md) How to style components from this package with pre-made themes, or do it yourself!
