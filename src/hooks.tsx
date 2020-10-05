import React from 'react';
import {
  AuthorKeypair,
  IStorage,
  StorageMemory,
  ValidatorEs4,
  syncLocalAndHttp,
  QueryOpts,
  DocToSet,
  Document,
  isErr,
  EarthstarError,
  WriteResult,
  ValidationError,
} from 'earthstar';

const StorageContext = React.createContext<{
  storages: Record<string, IStorage>; // workspace address --> IStorage instance
  setStorages: React.Dispatch<React.SetStateAction<Record<string, IStorage>>>;
}>({ storages: {}, setStorages: () => {} });

const PubsContext = React.createContext<{
  pubs: Record<string, string[]>; // workspace address --> pub urls
  setPubs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}>({ pubs: {}, setPubs: () => {} });

const CurrentAuthorContext = React.createContext<{
  currentAuthor: AuthorKeypair | null;
  setCurrentAuthor: React.Dispatch<React.SetStateAction<AuthorKeypair | null>>;
}>({ currentAuthor: null, setCurrentAuthor: () => {} });

export function EarthstarPeer({
  initWorkspaces = [],
  initPubs = {},
  initCurrentAuthor = null,
  children,
}: {
  initWorkspaces?: IStorage[];
  initPubs?: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair | null;
  children: React.ReactNode;
}) {
  const [storages, setStorages] = React.useState(
    initWorkspaces.reduce<Record<string, IStorage>>((acc, storage) => {
      return { ...acc, [storage.workspace]: storage };
    }, {})
  );

  const [pubs, setPubs] = React.useState(initPubs);

  const [currentAuthor, setCurrentAuthor] = React.useState(initCurrentAuthor);

  React.useEffect(() => {
    const unsubscribes = initWorkspaces.map(storage => {
      return storage.onChange.subscribe(() => {
        setStorages(prev => ({ ...prev }));
      });
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  });

  return (
    <StorageContext.Provider value={{ storages, setStorages }}>
      <PubsContext.Provider value={{ pubs, setPubs }}>
        <CurrentAuthorContext.Provider
          value={{ currentAuthor, setCurrentAuthor }}
        >
          {children}
        </CurrentAuthorContext.Provider>
      </PubsContext.Provider>
    </StorageContext.Provider>
  );
}

export function useWorkspaces() {
  const { storages } = React.useContext(StorageContext);

  return Object.keys(storages);
}

export function useAddWorkspace() {
  const { setStorages } = React.useContext(StorageContext);

  return React.useCallback(
    (address: string) => {
      try {
        const newStorage = new StorageMemory([ValidatorEs4], address);

        setStorages(prev => ({
          ...prev,
          [address]: newStorage,
        }));

        return void 0;
      } catch (err) {
        if (isErr(err)) {
          return err;
        }

        return new EarthstarError('Something went wrong!');
      }
    },
    [setStorages]
  );
}

export function useRemoveWorkspace() {
  const { setStorages } = React.useContext(StorageContext);

  return React.useCallback(
    (address: string) => {
      setStorages(prev => {
        const prevCopy = { ...prev };

        delete prevCopy[address];

        return prevCopy;
      });
    },
    [setStorages]
  );
}

export function useWorkspacePubs(
  workspaceAddress: string
): [string[], (pubs: React.SetStateAction<string[]>) => void] {
  const { pubs: existingPubs, setPubs } = React.useContext(PubsContext);

  const workspacePubs = existingPubs[workspaceAddress] || [];
  const setWorkspacePubs = React.useCallback(
    (pubs: React.SetStateAction<string[]>) => {
      setPubs(({ [workspaceAddress]: prevWorkspacePubs, ...rest }) => {
        if (Array.isArray(pubs)) {
          return { ...rest, [workspaceAddress]: Array.from(new Set(pubs)) };
        }
        const next = pubs(prevWorkspacePubs || []);
        return { ...rest, [workspaceAddress]: Array.from(new Set(next)) };
      });
    },
    [setPubs, workspaceAddress]
  );

  return [workspacePubs, setWorkspacePubs];
}

export function usePubs(): [
  Record<string, string[]>,
  React.Dispatch<React.SetStateAction<Record<string, string[]>>>
] {
  const { pubs, setPubs } = React.useContext(PubsContext);

  return [pubs, setPubs];
}

export function useCurrentAuthor(): [
  AuthorKeypair | null,
  React.Dispatch<React.SetStateAction<AuthorKeypair | null>>
] {
  const { currentAuthor, setCurrentAuthor } = React.useContext(
    CurrentAuthorContext
  );

  return [currentAuthor, setCurrentAuthor];
}

export function useSync() {
  const { storages } = React.useContext(StorageContext);
  const { pubs } = React.useContext(PubsContext);

  return React.useCallback(
    (address: string) => {
      return new Promise((resolve, reject) => {
        const storage = storages[address];

        if (!storage) {
          reject(new Error('Workspace not found'));
        }

        const workspacePubs = pubs[address];

        if (!workspacePubs) {
          reject(new Error('No pubs found for workspace'));
        }

        Promise.all(
          workspacePubs.map(pubUrl => syncLocalAndHttp(storage, pubUrl))
        ).finally(resolve);
      });
    },
    [pubs, storages]
  );
}

export function usePaths(workspaceAddress: string) {
  const { storages } = React.useContext(StorageContext);

  return React.useCallback(
    (query: QueryOpts) => {
      const storage = storages[workspaceAddress];

      if (!storage) {
        console.warn(
          `Couldn't find workspace with address ${workspaceAddress}`
        );
        return [];
      }

      return storage.paths(query);
    },
    [storages, workspaceAddress]
  );
}

export function useDocument(
  workspaceAddress: string,
  path: string
): [
  Document | undefined,
  (
    content: string,
    deleteAfter?: number | null | undefined
  ) => WriteResult | ValidationError,
  () => void
] {
  const { storages } = React.useContext(StorageContext);
  const [currentAuthor] = useCurrentAuthor();

  const storage = storages[workspaceAddress];

  const document = storage ? storage.getDocument(path) : undefined;

  const set = React.useCallback(
    (content: string, deleteAfter?: number | null | undefined) => {
      if (!storage) {
        return new ValidationError(
          `useDocument couldn't get the workspace ${workspaceAddress}`
        );
      }

      if (!currentAuthor) {
        console.warn('Tried to set a document when no current author was set.');
        return new ValidationError(
          'Tried to set a document when no current author was set.'
        );
      }

      const docToSet: DocToSet = {
        format: 'es.4',
        path,
        content,
        deleteAfter,
      };

      return storage.set(currentAuthor, docToSet);
    },
    [path, currentAuthor, storage, workspaceAddress]
  );

  const deleteDoc = () => {
    set('');
  };

  return [document, set, deleteDoc];
}

export function useStorages(): [
  Record<string, IStorage>,
  React.Dispatch<React.SetStateAction<Record<string, IStorage>>>
] {
  const { storages, setStorages } = React.useContext(StorageContext);

  return [storages, setStorages];
}
