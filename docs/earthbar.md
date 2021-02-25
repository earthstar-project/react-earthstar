# Earthbar

![The Earthbar](images/earthbar.png)

In many cases, building a decent Earthstar app will mean providing a lot of features: managing workspaces, pubs, identities, invitations, etc.

Additionally, people using your app may not know how an Earthstar app is different from what they're used to, and will need guidance through these concepts.

It'd be better if you could spend your time building the stuff that makes your app special, and have that table-stakes stuff taken care of for you.

The Earthbar is a drop-in solution with accessible, customisable interfaces for managing workspaces, pubs, invitations and identities, as well as helpful guidance for how things work.

## Getting started

Import Earthbar and its basic layout styles:

```js
import { Earthbar } from 'react-earthstar';
import 'react-earthstar/styles/layout.css';
```

And render Earthbar somewhere inside EarthstarPeer:

```jsx
<EarthstarPeer>
  <Earthbar />
</EarthstarPeer>
```

And that might be all you need!

## Customising tabs

Maybe you want to change the order of tabs, or which tabs are available. You might even want to add your own (see below 'Creating your own tabs').

Let's say we wanted the Author tab on the left, and the workspace tab on the right. First, we'd import AuthorTab, WorkspaceTab, and Spacer (to fill the space between them).

```jsx
import { Earthbar, AuthorTab, Spacer, WorkspaceTab } from 'react-earthstar';
```

Then we'd pass them as children of Earthbar:

```jsx
<Earthbar>
  <AuthorTab />
  <Spacer />
  <WorkspaceTab />
</Earthbar>
```

You can pass anything in here, not just tabs, so you can do stuff like this:

```jsx
<Earthbar>
  <NeonPinkFlashingBackground>
    <AuthorTab />
  </NeonPinkFlashingBackground>
  <Spacer />
  <ButtonThanHonks />
  <WorkspaceTab />
</Earthbar>
```

If you'd like to create your own tabs, check out 'Creating your own tabs' below.

## Available tabs

### WorkspaceTab

![Workspace panel](images/workspace-panel.png)

This tab lets you select the current workspace from the tab bar, settings for the current workspace, as well as tabs for adding workspaces using an invitation code, or making a new one.

![Join Panel](images/join-panel.png)

![Create panel](images/create-panel.png)

### MultiWorkspaceTab

![Workspace panel](images/multi-workspace-panel.png)

This tab differs slightly from WorkspaceTab in that it is for apps that ignore the 'current workspace' concept, instead showing data from many workspaces at once. It has interfaces for managing all the known workspaces, as well as tabs for adding workspaces using an invitation code, or making a new one.

Note: Rendering this component will make it so that the value of `currentWorkspace` will always be forced back to `null`.

### AuthorTab

This tab offers two interfaces:

![New User Panel](images/new-user-panel.png)

If there is no current author, there's a tab for creating a new user, or logging in with an address + secret, or a keypair.json file. There is also helper text for users to understand Earthstar's authentication model.

![User Panel](images/new-user-panel.png)

Alternatively, if there is a current author, there's a tab for changing your display name, copying your address + secret, downloading your identity as a keypair.json, and logging out.

## Styling

If you're using a bundler that supports CSS imports (e.g. like the one that comes with Create React App), add the following to your app:

```js
import "react-earthstar/styles/layout.css";
import "react-earthstar/styles/junior.css";
```

This will import the basic layout styles and a default theme for Earthbar.

To learn more, see the [styling guide](styling.md)

## Creating your own tabs

If you'd like to create your own tabs, you'll need to use some related components to build them, as Earthbar offers full keyboard accessibility and focus management (and you wouldn't want to break that, would you?)

```jsx
import { EarthbarTab, EarthbarTabLabel, EarthbarTabPanel}

function MyCoolTab() {
  return (
    <EarthstarTab>
      <EarthstarLabel>
        {"More cool features!"}
      </EarthstarLabel>
      <EarthbarTabPanel>
        <MoreCoolFeatures />
      </EarthbarTabPanel>
    </EarthstarTab>
  );
}
```

These elements can be nested or composed as you like, meaning you can do stuff like this:

```jsx
import { EarthbarTab, EarthbarTabLabel, EarthbarTabPanel}

function MyPanel() {
  return <EarthbarTabPanel>
  <MoreCoolFeatures />
</EarthbarTabPanel>
}

function MyCoolTab() {
  return (
    <EarthstarTab>
      <div style={{background: 'yellow'}}>
        <EarthstarLabel>
          {"More cool features!"}
        </EarthstarLabel>
      </div>
      <MyPanel/>
    </EarthstarTab>
  );
}
```
