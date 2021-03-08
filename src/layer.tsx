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

  writePost(content: string, deleteAfter?: number) {
    let id = `${Date.now()}`;

    return this._setPost(id, content, deleteAfter);
  }

  editPost(id: string, content: string, deleteAfter?: number) {
    return this._setPost(id, content, deleteAfter);
  }

  deletePost(id: string) {
    return this._setPost(id, '');
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

export function useLayer<ConfigType, LayerType extends Layer<ConfigType>>(
  LayerClass: new (storage: IStorageAsync, config: ConfigType) => LayerType,
  config: ConfigType,
  workspaceAddress?: string
) {
  const storage = useStorage(workspaceAddress);

  const [layer, setLayer] = React.useState(() => {
    if (storage) {
      return new LayerClass(storage, config);
    }

    return null;
  });

  useDeepCompareEffect(() => {
    if (storage) {
      const newLayer = new LayerClass(storage, config);

      setLayer(newLayer);
    }
  }, [storage, config]);

  return layer;
}

export function useLayerAsyncSelector<
  ConfigType,
  LayerType extends Layer<ConfigType>,
  ReturnType
>(layer: LayerType, selector: (layer: LayerType) => Promise<ReturnType>) {
  const [result, setResult] = React.useState<ReturnType | undefined>(undefined);

  React.useEffect(() => {
    selector(layer).then(result => setResult(result));

    const unsubscribe = layer.subscribe(() => {
      selector(layer).then(result => {
        console.log(result);
        setResult(result);
      });
    });

    return unsubscribe;
  }, [layer, selector]);

  return result;
}

// The useLayer hook enables nicer APIs like this with react-earthstar

export function LayerTestApp() {
  const [currentAuthor] = useCurrentAuthor();

  const lobbyLayer = useLayer(
    LobbyLayer,
    currentAuthor
      ? {
          currentAuthor,
        }
      : {}
  );

  /* 
  const reactions = useLayer(ReactionLayer);
  const trustnet = useLayer(TrustnetLayer, { rootId: currentAuthor.address });
  */

  return lobbyLayer ? <LobbyApp layer={lobbyLayer} /> : null;
}

function LobbyApp({ layer }: { layer: LobbyLayer }) {
  const [newPost, setNewPost] = React.useState('');
  const getPosts = React.useCallback(
    (layer: LobbyLayer) => layer.getPosts(),
    []
  );
  const posts = useLayerAsyncSelector(layer, getPosts);

  return (
    <>
      <form
        onSubmit={async e => {
          e.preventDefault();

          await layer.writePost(newPost);
        }}
      >
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        ></textarea>
        <button type={'submit'}>{'Post!'}</button>
      </form>
      {posts
        ? posts.map(post => {
            return <div key={post.path}>{post.content}</div>;
          })
        : 'Hm!'}
    </>
  );
}
