# <EarthstarPeer>

`EarthstarPeer` coordinates the state of your Earthstar app. This includes:

- Workspaces
- Known Pub servers for those workspaces
- The current user, used to sign all written documents
- The current workspace
- Whether syncing is active or not

As long as the React hooks and components used from this library are rendered within an `EarthstarPeer`, they'll work just fine.

## Initial values

`EarthstarPeer` also has props which set the initial values for this state. This is useful for cases like initialising with values kept in local storage.

```jsx
import { EarthstarPeer } from 'react-earthstar';

// Get the current author from local storage
const currentAuthor = JSON.parse(
  window.localStorage.getItem('earthstar-author')
);

function MyApp() {
  return (
    <EarthstarPeer initCurrentAuthor={currentAuthor}>
      <SomeCoolFeature />
    </EarthstarPeer>
  );
}
```

The full list of initial values you can provide as props are:

```ts
{
  // An array of workspacesr as instances of Earthstar's IStorage class
  initWorkspaces?: IStorage[];
  // Pub servers, where the keys are workspace addresses and the values are arrays of Pub Server URLs
  initPubs?: Record<string, string[]>;
  // The current author
  initCurrentAuthor?: AuthorKeypair | null;
  // The currently active workspace
  initCurrentWorkspace?: string | null;
  // Whether the app is syncing with Pub servers or not
  initIsLive?: boolean;
}
```
