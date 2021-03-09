import { AuthorKeypair, IStorageAsync, Query, WriteEvent } from 'earthstar';
import * as React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useCurrentAuthor, useCurrentWorkspace, useStorage } from './hooks';

type Thunk = () => void;
type Cb = (evt: WriteEvent) => void;
type UnsubFn = Thunk;

/*
 * Make a proxy copy of an IStorage.
 *
 * It looks and acts exactly like a regular storage,
 *  except it remembers every path that we read from it
 *  and every query we do.
 * It lets you subscribe to updates for those docs and queries.
 * In other words, it auto-subscribes based on
 *  your specific access patterns.
 *
 * You can make multiple proxies for the same storage
 *  and each one will have its own memory of what has been accessed.
 * So you can think of it almost like a cursor,
 *  and use it in a react hook where each component gets
 *  its own proxy instance with its own memory.
 *
 * Special functionality
 * ---------------------
 *
 * To call these special functions you have to trick TypeScript
 * with "as any" because they're not normal IStorage functions.
 *
 * (proxy as any).___clearWatches()
 *      Reset the watched paths and queries back to empty.
 *      You probably want to do this at the beginning of every
 *       React render so that you're only watching the paths
 *       used in the most recent render.
 *
 * (proxy as any).___subscribe(callback) => unsub()
 *      Subscribe to WriteEvents related to the watched paths
 *       and queries.
 *      This returns an unsubscribe function to cancel
 *       the subscription.
 *      The callback signature is:
 *          callback(evt: WriteEvent) => void
 *      WriteEvent is a type from Earthstar that looks like:
 *           export type WriteEvent = {
 *               kind: 'DOCUMENT_WRITE',
 *               document: Document,
 *               fromSessionId: string,  // which peer gave it to us
 *               isLocal: boolean,  // did we initiate this write ourself?
 *               isLatest: boolean,  // is this the latest doc at this path?
 *           }
 *
 * (proxy as any).___clearSubscriptions()
 *      Remove all the proxy's subscribers.
 *      (This does not affect the proxy's internal subscription
 *       to the storage's write events)
 *
 * (proxy as any).___watchedPaths
 * (proxy as any).___watchedDocQueries
 *      These are Sets of the paths and queries that have been
 *       read through this proxy since the last clearWatches().
 *      Normally you don't need to access this directly.
 *      You could manually add and remove things from them
 *       if you wanted to.
 */

interface StorageProxy extends IStorageAsync {
  watchedPaths: Set<string>;
  watchedDocQueries: Set<Query>;
  clearWatches: () => void;
  subscribe: (cb: Cb) => Thunk;
  clearSubscriptions: () => void;
}

export let makeStorageProxy = (storage: IStorageAsync): StorageProxy => {
  // the paths and queries we're watching.
  //   TODO: we could consider caching the query results
  //   to avoid sending too many notifications when the
  //   query results have not actually changed, but that
  //   could use a lot of memory.
  let ___watchedPaths = new Set<string>();
  let ___watchedDocQueries = new Set<Query>();

  // the Proxy handler
  let handler = {
    // when a property is looked up on the proxy object:
    get: function(target: any, prop: any) {
      // target is the storage object
      // prop is a string, the name of the property being accessed

      // look up the property
      let result = target[prop];

      if (typeof result !== 'function') {
        // if it's just a primitive property, just return it.

        return result;
      } else {
        // if it's a function, put a wrapper around it
        // so we can inspect the arguments.

        return (...args: any[]): any => {
          // notice certain functions...
          if (prop === 'getDocument' || prop === 'getContent') {
            // args: (path: string)

            let path: string = args[0];

            ___watchedPaths.add(path);
          }
          if (prop === 'documents' || prop === 'contents') {
            // args: (query?: Query)
            let query: Query = args[0] || {};

            ___watchedDocQueries.add(query);
          }
          // TODO:
          // more functions to watch
          // * paths(query: QueryNoLimitBytes)
          // * authors()
          return result.bind(target)(...args);
        };
      }
    },
  };
  let proxy = new Proxy<IStorageAsync>(storage, handler) as StorageProxy;

  // add our special variables and methods to the proxy
  // so we can use them from outside it
  proxy.watchedPaths = ___watchedPaths;
  proxy.watchedDocQueries = ___watchedDocQueries;

  proxy.clearWatches = () => {
    ___watchedPaths.clear();
    ___watchedDocQueries.clear();
  };

  // let users of the proxy subscribe to writeEvents they will care about
  let ___cbs = new Set<Cb>();
  proxy.subscribe = (cb: any): UnsubFn => {
    ___cbs.add(cb);
    return () => ___cbs.delete(cb);
  };
  proxy.clearSubscriptions = () => {
    ___cbs.clear();
  };

  // subscribe the proxy itself to WriteEvents from Earthstar
  let unsubFromStorage = storage.onWrite.subscribe((evt: WriteEvent) => {
    // We've gotten a write event.  Do we care about it?
    // Filter the events to only the docs and queries we're watching.
    let shouldRunCallbacks = false;

    // Easy to check for specific paths we're watching...
    if (___watchedPaths.has(evt.document.path)) {
      shouldRunCallbacks = true;
    }

    // Hard to check if the event fits any of our watched queries.
    // We want to do something like this:
    //      for (let query of ___watchedDocQueries) {
    //          if (queryMatchesDoc(query, evt.document)) {
    //              shouldRunCallbacks = true;
    //          }
    //      }
    // But we also need to test if the old version of the doc
    //  that was overwritten matched the query, so we know when
    //  a doc is leaving the set of query results.
    // And if the query has certain non-local selectors we can't
    //  figure it out just by looking at one doc at a time.
    // (Those non-local selectors are historyMode, limit, and limitBytes.)
    // So we need to first make WriteEvents include the previous
    //  version that was being overwritten, and then we need to check
    //  for those non-local selectors.

    // Instead, for now, we just have to conservatively assume
    // that any document write MIGHT match any query:
    if (___watchedDocQueries.size > 0) {
      shouldRunCallbacks = true;
    }

    // Run the callbacks

    if (shouldRunCallbacks) {
      ___cbs.forEach(cb => cb(evt));
    }
  });

  // When the storage closes, shut down this proxy object too.
  storage.onWillClose.subscribe(() => {
    proxy.clearSubscriptions();
    proxy.clearWatches();
    unsubFromStorage();
  });

  return proxy as StorageProxy;
};

// --

interface Task {
  id: string;
  text: string; // primary doc
  done: boolean;
}

interface TaskEvent {
  kind: 'CHANGE' | 'DELETE';
  id: string;
}

export interface LayerInstance<EventType> {
  proxy: StorageProxy;
  subscribe: (callback: (event: EventType) => void) => Thunk;
}

export class TodoLayer implements LayerInstance<TaskEvent> {
  proxy: StorageProxy;
  constructor(storage: IStorageAsync) {
    // Make an auto-watching proxy for our storage.
    // We don't have to manually track which docs we've accessed
    // so we know which things to notify our subscribers about;
    // this does it for us.
    // We can just use it like a regular Storage object.
    this.proxy = makeStorageProxy(storage);
  }
  // subscribe
  subscribe(cb: (taskEvent: TaskEvent) => void) {
    // We get WriteEvents from the Earthstar storage for individual
    // docs.  Somehow we have to translate those into TaskEvents
    // for entire tasks, which are made of multiple docs, without
    // emitting multiple events for the same Task.
    // Our solution for now is to treat one of a task's documents
    // as the "primary doc" and sometimes ignore the other docs.

    let unsub = this.proxy.subscribe((evt: WriteEvent) => {
      let id = evt.document.path.split('/')[2];
      if (evt.document.content === '') {
        // only pay attention when the primary doc is deleted
        if (evt.document.path.endsWith('/text.txt')) {
          cb({ kind: 'DELETE', id });
        }
      } else {
        // but pay attention when any doc is edited
        cb({ kind: 'CHANGE', id });
      }
    });
    return unsub;
  }

  clearWatches() {
    // wipe the memory of which docs we've accessed and are watching
    this.proxy.clearWatches();
  }
  // read
  async list(): Promise<Task[]> {
    // paths like /task/ID/text.txt
    //            /task/ID/done.json
    let tasks: Record<string, Task> = {};
    let docs = await this.proxy.documents({
      pathStartsWith: '/task/',
    });
    for (let doc of docs) {
      let id = doc.path.split('/')[2];
      let task: Record<string, any> = tasks[id] || { id };
      if (doc.path.endsWith('/text.txt')) {
        task.text = doc.content;
      }
      if (doc.path.endsWith('/done.json')) {
        // this doc can be missing; it defaults to false if so
        task.done = doc.content === 'true';
      }
      tasks[id] = task as Task;
    }
    // incomplete tasks missing their primary doc
    // are deleted here as if they don't exist at all,
    // in case there was an incomplete sync.
    for (let [id, task] of Object.entries(tasks)) {
      if (task.text === undefined || task.text === '') {
        delete tasks[id];
      }
    }
    return Object.values(tasks);
  }

  async get(id: string): Promise<Task | undefined> {
    let textContent = await this.proxy.getContent('/task/' + id + '/text.txt');
    let doneContent = await this.proxy.getContent('/task/' + id + '/done.json');
    // if primary doc is missing, the whole Task is missing.
    if (textContent === undefined) {
      return undefined;
    }
    // if the other doc is missing, it defaults to false
    let done = doneContent === undefined ? false : doneContent === 'true';
    return {
      id,
      text: textContent,
      done,
    };
  }
  // write
  async add(keypair: AuthorKeypair, task: Task) {
    await this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + task.id + '/text.txt',
      content: task.text,
    });
    await this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + task.id + '/done.json',
      content: JSON.stringify(task.done),
    });
  }

  async toggle(keypair: AuthorKeypair, id: string) {
    let task = await this.get(id);
    if (task === undefined) {
      return;
    }
    task.done = !task.done;
    this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + task.id + '/done.json',
      content: JSON.stringify(task.done),
    });
  }
  async setDone(keypair: AuthorKeypair, id: string, done: boolean) {
    await this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + id + '/done.json',
      content: JSON.stringify(done),
    });
  }
  async delete(keypair: AuthorKeypair, id: string) {
    await this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + id + '/text.txt',
      content: '',
    });
    await this.proxy.set(keypair, {
      format: 'es.4',
      path: '/task/' + id + '/done.json',
      content: '',
    });
  }
}

export class DirectLayer implements LayerInstance<WriteEvent> {
  proxy: StorageProxy;
  constructor(storage: IStorageAsync) {
    this.proxy = makeStorageProxy(storage);
  }

  subscribe(cb: Cb) {
    return this.proxy.subscribe(cb);
  }
}

export function useLayer<
  ConfigType,
  EventType,
  LayerType extends LayerInstance<EventType>
>(
  LayerCtor: new (storage: IStorageAsync, config?: ConfigType) => LayerType,
  config?: ConfigType,
  workspaceAddress?: string
) {
  const storage = useStorage(workspaceAddress);
  const [, reRender] = React.useState(true);

  if (!storage) {
    throw new Error('Tried to use useLayer with no workspace specified!');
  }

  const layerRef = React.useRef(new LayerCtor(storage, config));

  React.useEffect(() => {
    const unsub = layerRef.current.subscribe(() => {
      reRender(prev => !prev);
    });

    layerRef.current.proxy.clearWatches();

    return () => {
      unsub();
    };
  }, []);

  useDeepCompareEffect(() => {
    layerRef.current = new LayerCtor(storage, config);
  }, [storage, config]);

  return layerRef.current;
}

export function useLayerPromise<
  EventType,
  LayerType extends LayerInstance<EventType>,
  ReturnType,
  ConfigType
>(
  LayerCtor: new (storage: IStorageAsync, config?: ConfigType) => LayerType,
  selector: (layer: LayerType) => Promise<ReturnType>,
  config?: ConfigType
) {
  const layer = useLayer(LayerCtor, config);

  const [result, setResult] = React.useState<ReturnType | undefined>(undefined);

  React.useEffect(() => {
    let ignore = false;

    selector(layer).then(result => {
      if (!ignore) {
        setResult(result);
      }
    });

    return () => {
      ignore = true;
    };
  }, [layer, selector]);

  React.useEffect(() => {
    let ignore = false;

    const unsubscribe = layer.subscribe(() => {
      selector(layer).then(result => {
        if (!ignore) {
          setResult(result);
        }
      });
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
    // We can safely ignore layer below because it's a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  return result;
}

export function OnlyWithWorkspace({ children }: { children: React.ReactNode }) {
  const [currentWorkspace] = useCurrentWorkspace();

  return currentWorkspace ? children : null;
}

export function TodoApp() {
  const selector = React.useCallback((layer: TodoLayer) => layer.list(), []);
  const list = useLayerPromise(TodoLayer, selector);

  return (
    <div>
      <h1>{'My Todos'}</h1>
      <TodoAdder />
      {
        <ul>
          {list?.map(todo => (
            <TodoItem key={todo.id} id={todo.id} />
          ))}
        </ul>
      }
    </div>
  );
}

export function TodoAdder() {
  const todoLayer = useLayer(TodoLayer);
  const [currentAuthor] = useCurrentAuthor();

  const [newTodo, setNewTodo] = React.useState('');

  if (!currentAuthor) {
    return <p>{'Sign in to add Todos.'}</p>;
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        todoLayer.add(currentAuthor, {
          text: newTodo,
          done: false,
          id: `${Date.now()}`,
        });

        setNewTodo('');
      }}
    >
      <input value={newTodo} onChange={e => setNewTodo(e.target.value)} />
      <button type={'submit'}>{'Add todo'}</button>
    </form>
  );
}

export function TodoItem({ id }: { id: string }) {
  const todoLayer = useLayer(TodoLayer);
  const [currentAuthor] = useCurrentAuthor();

  const selector = React.useCallback((layer: TodoLayer) => layer.get(id), [id]);
  const todo = useLayerPromise(TodoLayer, selector);

  return todo ? (
    <li>
      <input
        type={'checkbox'}
        checked={todo.done}
        onChange={async () => {
          if (!currentAuthor) {
            return;
          }
          todoLayer.toggle(currentAuthor, todo.id);
        }}
      />
      <span>{todo.text}</span>
      {currentAuthor && (
        <button
          onClick={() => {
            todoLayer.delete(currentAuthor, id);
          }}
        >
          Delete
        </button>
      )}
    </li>
  ) : null;
}
