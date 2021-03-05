import * as React from 'react';
import {
  IStorage,
  IStorageAsync,
  AuthorKeypair,
  WriteEvent,
  Thunk,
  Query,
  ValidationError,
} from 'earthstar';
import { useCurrentAuthor, useStorage } from '.';
import useDeepCompareEffect from 'use-deep-compare-effect';

// We've talked about representing earthstar formats as reusable 'layers'
// which act as descriptions and utilities for using that format
// The layer base class would be part of the core library.

export class Layer<ConfigType> {
  _storage: IStorage | IStorageAsync;
  _config: ConfigType;
  _subscriptions: Thunk[] = [];

  constructor(storage: IStorage | IStorageAsync, options: ConfigType) {
    this._storage = storage;
    this._config = options;
  }

  subscribe(onWrite: (event: WriteEvent) => void) {
    let subscription = this._storage.onWrite.subscribe(onWrite);
    this._subscriptions = [...this._subscriptions, subscription];
  }

  unsubscribe() {
    this._subscriptions.forEach(unsubscribe => unsubscribe());
  }
}

// LobbyLayer subclasses Layer and exposes
// getPosts
// writePost
// editPost
// deletePost
// subscribe (listens for document writes with paths shaped like /lobby/*.txt)

// layer classes like these could be their own packages on npm
// e.g. LobbyLayer, TodoLayer, TrustnetLayer <-- this is what I'm working towards

export class LobbyLayer extends Layer<{ currentAuthor?: AuthorKeypair }> {
  async getPosts(query?: Query) {
    return await this._storage.documents({
      ...query,
      pathStartsWith: '/lobby/',
      pathEndsWith: '.txt',
    });
  }

  _setPost(id: string, content: string, deleteAfter?: number) {
    const { currentAuthor } = this._config;

    if (!currentAuthor) {
      return Promise.resolve(
        new ValidationError('Tried to write a lobby post with no author')
      );
    }

    return this._storage.set(currentAuthor, {
      path: `/lobby/~${currentAuthor.address}/${
        deleteAfter ? '!' : ''
      }${id}.txt`,
      content,
      deleteAfter,
      format: 'es.4',
    });
  }

  async writePost(content: string, deleteAfter?: number) {
    let id = `${Date.now()}`;

    await this._setPost(id, content, deleteAfter);
  }

  async editPost(id: string, content: string, deleteAfter?: number) {
    await this._setPost(id, content, deleteAfter);
  }

  async deletePost(id: string) {
    await this._setPost(id, '');
  }

  subscribe(onWrite: (event: WriteEvent) => void) {
    let subscription = this._storage.onWrite.subscribe(event => {
      if (
        event.document.path.startsWith('/lobby/') &&
        event.document.path.endsWith('.txt')
      ) {
        onWrite(event);
      }
    });
    this._subscriptions = [...this._subscriptions, subscription];
  }
}

// A useLayer hook which takes any Layer subclass
// and instantiates it with the given workspace + config
// AND invalidates itself when there are changes.
// The current (naive) way I am doing this is to trigger a rerender
// and thus 'invalidate' the layer's subsequent usages
// every time the layer's subscribe function fires.

export function useLayer<ConfigType>(
  LayerClass: typeof Layer,
  config: ConfigType,
  workspaceAddress?: string
) {
  const storage = useStorage(workspaceAddress);

  const [layer, setLayer] = React.useState<Layer<ConfigType> | undefined>();
  const [, setTickTock] = React.useState(false);

  useDeepCompareEffect(() => {
    if (storage) {
      const newLayer = new LayerClass<ConfigType>(storage, config);

      setLayer(newLayer);
    }
  }, [storage, config]);

  React.useEffect(() => {
    layer?.subscribe(() => {
      setTickTock(prev => !prev);
    });

    return () => {
      layer?.unsubscribe();
    };
  });

  return layer;
}

// The useLayer hook enables nicer APIs like this with react-earthstar

// TODO: Tried to get fancy with generics, was duly punished.
// I want to make sure the methods on `lobby` are nicely exposed by TS...

export function MyComponent() {
  const [currentAuthor] = useCurrentAuthor();

  const lobby = useLayer(LobbyLayer, {
    currentAuthor: currentAuthor || undefined,
  });

  /* 
  const reactions = useLayer(ReactionLayer);
  reactions.getReactionFor(doc);
  const trustnet = useLayer(TrustnetLayer, { rootId: currentAuthor.address });
  trustnet.getAllTrusted()
  */

  return (
    <div>
      {lobby ? lobby.getPosts().map(postDoc => <div>{doc.content}</div>) : null}
    </div>
  );
}
