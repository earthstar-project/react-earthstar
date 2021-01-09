# Hooks

These [React Hooks](https://reactjs.org/docs/hooks-intro.html) give you all the nuts and bolts for common tasks like reading and writing documents, adding workspaces, or turning syncing on and off.

One of the key advantages of using these React hooks over directly using the core Earthstar library is that these hooks will automatically update when underlying data in a workspace changes.

## useWorkspaces

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

add('+newclub.x789');
```

### useRemoveWorkspace

Returns a function you can use to remove an existing workspace from your app.

```jsx
const remove = useRemoveWorkspace();

remove('+myworkspace.a123');
```

### useWorkspacePubs

Use this to get a given workspace's pubs and modify them.

```jsx
const [pubs, setPubs] = useWorkspacePubs('+myworkspace.a123');

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

### useCurrentWorkspace

Use this get and modify the current workspace.

```jsx
const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();

setCurrentWorkspace('+books.a123');
```

The current workspace state is used by many of the other hooks in the absence of a value for a workspace argument.

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

Returns a list of paths for a `QueryOpts` arg.

This hook will automatically re-render the component it's used in when the list of paths updates.

This hook takes an optional second argument representing the workspace to get the paths from. If this is not provided, the current workspace is used instead.

```jsx
const paths = usePaths({
  pathPrefix: '/wiki/',
});

console.log(paths);
/*
["/wiki/birds", "/wiki/plants", "/wiki/nuts"]
*/
```

### useDocument

Use this to get a document, modify, or delete it.

This hook will automatically re-render the component it's used in when the document updates.

This hook takes an optional second argument representing the workspace to get the paths from. If this is not provided, the current workspace is used instead.

```jsx
const [doc, setDoc, deleteDoc] = useDocument('/messages/welcome.txt');

console.log(doc.content);
// "Welcome to our workspace!"

setDoc('Welcome, welcome, one and all!');
```

### useDocuments

Returns a list of documents for a given `QueryOpts` arg. Useful for when you want to obtain an unknown number of documents for use in a single component.

This hook will automatically re-render the component it's used in when the list of documents matching the query updates.

This hook takes an optional second argument representing the workspace to get the paths from. If this is not provided, the current workspace is used instead.

```jsx
const docs = useDocuments({
  pathPrefix: '/shopping-list/',
});

console.log(docs.map((doc) => doc.content));
/*
["Eggs", "Broccoli", "Mustard"]
*/
```

### useInvitation

Parses an Earthstar invitation code and returns a function which will add the encoded workspace and pubs.

```jsx
const { redeem, workspace, pubs } = useInvitation(
  'earthstar:///?workspace=+earthstardev.p7fa9&pub=https://earthstar-demo-pub-v5-a.glitch.me&v=1'
);

console.log(workspace);
/* "+earthstardev.p7fa9" */
console.log(pubs);
/* ["https://earthstar-demo-pub-v5-a.glitch.me"] */
redeem();
```

### useMakeInvitation

Generates an invitation code which others can use to quickly join a workspace using some pubs.

The first argument is a list of pubs to _exclude_ from the generated code. The code will include any pubs which are known by EarthstarApp and not provided in this argument.

This hook takes an optional second argument representing the workspace to encode into the invitation. If this is not provided, the current workspace is used instead.

```jsx
const code = useMakeInvitation(['https://secret.pub']);

console.log('code');
/* earthstar:///?workspace=+earthstardev.p7fa9&pub=https://earthstar-demo-pub-v5-a.glitch.me&v=1*/
```

### useStorages

Use this to get and modify the underlying store of `IStorage`s. This is meant as an escape hatch, and will probably have to be used in combination with `useSubscribeToStorages` so that your data does not become stale.

```jsx
const [storages, setStorages] = useStorages();

console.log(storages);
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
const [greeting, setGreeting] = React.useState('');

useSubscribeToStorages({
  workspaces: ['+myworkspace.a123'],
  paths: ['/greeting.txt'],
  onWrite: (event) => {
    setGreeting(event.document.content);
  },
});
```
