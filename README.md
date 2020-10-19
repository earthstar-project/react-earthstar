# react-earthstar

[Earthstar](https://github.com/earthstar-project/earthstar) apps can be lots of different things: blogs, wikis, to-do lists... but they often need to do a lot of similar jobs, like adding or removing workspaces, editing pubs, or letting you log in out.

In the context of an app, they also need to have interfaces which always show the latest data.

react-earthstar provides tools for these common tasks and requirements so that you can focus on the exciting bits of your app.

- It has hooks for your components to easily fetch the data and actions they need, and which also automatically update your components when changes are made to the underlying data stores.
- There are also many components which you can simply place into your app (like a login form, or a pub editor), which you can use to build UIs for common tasks quickly.
- And finally, we're working on the Earthbar — a single component you can put into your app which acts as a kind of Earthstar control centre for managing workspaces, pubs, syncing, and the current author.

The hooks are ready to use and are all covered by tests. They can be used in any react renderer (e.g. react-dom, react-native).

There are a lot of components which you can import from `react-earthstar/components`, but we are still working on default styling, and styling guides so that you can style them to your desires.

Earthbar is being actively worked on, and is not yet available in this package. But soon!

All of these components are being built with accessibility as a given.

## Installation

`npm install react-earthstar@preview`

or 

`yarn add react-earthstar@preview`

## EarthstarPeer

The hooks and components in this package rely on being rendered within a `EarthstarPeer` component to get the data and functions they need.

This provider has a few assumptions it organises itself around conceptually. It assumes:

- A collection of workspaces
- A collection of pubs associated with each of those
- And a current author, which is represented by one of Earthstar's `AuthorKeypair`s (or null)

Wrap it around your app like this:

```jsx
import { EarthstarPeer } from 'react-earthstar';

function MyApp() {
  return (
    <EarthstarPeer>
      { /* This is your app using react-earthstar hooks and components! */ }
      <YourGreatApp />
    </EarthstarPeer>
  );
}
```

`EarthstarPeer` also has props which set the initial values for certain things. This is useful for cases like initialising with values kept in local storage.

```jsx
import { EarthstarPeer } from 'react-earthstar';

// Get the currentAuthor from local storage
const currentAuthor = JSON.parse(window.localStorage.getItem('earthstar-author'));

function MyApp() {
  return (
    <EarthstarPeer
      initCurrentAuthor={currentAuthor}
    >
      <YourGreatApp />
    </EarthstarPeer>
  );
}
```

The full list of initial values you can provide as props are:

```ts
{
  initWorkspaces?: IStorage[];
  initPubs?: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair | null;
}
```

## Hooks
 
### useWorkspaces

Returns a list of workspaces held by your app.

```jsx
const workspaces = useWorkspaces();
  
console.log(workspaces);
// ["+myworkspace.a123", "+otherspace.b456"] 
}
```
 
### useAddWorkspace

Returns a function you can use to add a new workspace to your app.

```jsx
const add = useAddWorkspace();

add("+newclub.x789")
```

### useRemoveWorkspace

Returns a function you can use to remove an existing workspace from your app.

```jsx
const remove = useRemoveWorkspace();

remove("+myworkspace.a123")
```

### useWorkspacePubs

Use this to get a given workspace's pubs and modify them.

```jsx
const [pubs, setPubs] = useWorkspacePubs("+myworkspace.a123");

console.log(pubs);
// ["https://a.pub", "https://b.club"]
```

### usePubs

Use this to get all your workspaces' known pubs and modify them.

```jsx
const [pubs, setPubs] = usePubs();

console.log(pubs);
/* 
{
  "+myworkspace.a123": ["https://a.pub", "https://b.club"],
  "+otherplace.b456": ["https://c.zone", "https://d.space"]
}
*/
```

### useCurrentAuthor

Use this to get and modify the current author.

```jsx
const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();
```

### useSync

Returns a function you can use to start a sync. The function returns a Promise.

```jsx
function SyncButton() {
  const sync = useSync();
  
  return (
    <button onClick=(() => sync('+myworkspace.a123'))>
      {"Sync!"}
    </button>
  )
} 

```

### usePaths

Returns a list of paths for a given workspace and `QueryOpts` arg.

This hook will automatically re-render the component it's used in when the list of paths updates.

```jsx
const paths = usePaths('+myworkspace.a123', {
  pathPrefix: "/wiki"
});

console.log('paths');
/*
["/wiki/birds", "/wiki/plants", "/wiki/nuts"]
*/

```

### useDocument

Use this to get a document, modify, or delete it.

This hook will automatically re-render the component it's used in when the document updates.

```jsx
const [doc, setDoc, deleteDoc] = useDocument("+myworkspace.a123", "/messages/welcome");

console.log(doc.content);
// "Welcome to our workspace!"

setDoc("Welcome, welcome, one and all!");
```

### useStorages

Use this to get and modify the underlying store of workspace `IStorage`s. This is meant as an escape hatch.

```jsx
const [storages, setStorages] = useStorages();

console.log(storages)
/*
{
  "+myworkspace.a123": IStorage,
  "+otherplace.b456": IStorage
}
*/
```

### useSubscribeToStorages

If you use `useStorages` to get some workspace data, your React components will not automatically update when changes are made to those workspaces. Use this hook to listen for certain events and provide a callback for what to do when those changes happen.

```jsx
const [greeting, setGreeting] = React.useState("")

useSubscribeToStorages({
  workspaces: ["+myworkspace.a123"],
  paths: ["/greeting.txt"],
  onWrite: (event) => {
    setGreeting(event.document.content);
  }
});
```
