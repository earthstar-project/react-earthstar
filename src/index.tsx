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
} from 'earthstar';

const StorageContext = React.createContext<{
  storages: Record<string, IStorage>;
  setStorages: React.Dispatch<React.SetStateAction<Record<string, IStorage>>>;
}>({ storages: {}, setStorages: () => {} });

const PubsContext = React.createContext<{
  pubs: Record<string, string[]>;
  setPubs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}>({ pubs: {}, setPubs: () => {} });

const CurrentAuthorContext = React.createContext<{
  currentAuthor: AuthorKeypair | undefined;
  setCurrentAuthor: React.Dispatch<
    React.SetStateAction<AuthorKeypair | undefined>
  >;
}>({ currentAuthor: undefined, setCurrentAuthor: () => {} });

export function EarthstarClient({
  initWorkspaces,
  initPubs,
  initCurrentAuthor,
  children,
}: {
  initWorkspaces: IStorage[];
  initPubs: Record<string, string[]>;
  initCurrentAuthor?: AuthorKeypair;
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
    Object.values(initWorkspaces).forEach(storage => {
      storage.onChange.subscribe(() => {
        setStorages(prev => ({ ...prev }));
      });
    });
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
      setStorages(prev => ({
        ...prev,
        [address]: new StorageMemory([ValidatorEs4], address),
      }));
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

export function usePubs(
  workspaceAddress: string
): [string[], (pubs: string[]) => void] {
  const { pubs: existingPubs, setPubs } = React.useContext(PubsContext);

  const workspacePubs = existingPubs[workspaceAddress];
  const setWorkspacePubs = React.useCallback(
    (pubs: React.SetStateAction<string[]>) => {
      setPubs(({ [workspaceAddress]: prevWorkspacePubs, ...rest }) => {
        if (Array.isArray(pubs)) {
          return { ...rest, [workspaceAddress]: pubs };
        }
        const next = pubs(prevWorkspacePubs || []);
        return { ...rest, [workspaceAddress]: next };
      });
    },
    [existingPubs, setPubs]
  );

  return [workspacePubs, setWorkspacePubs];
}

export function useCurrentAuthor(): [
  AuthorKeypair | undefined,
  (keypair: AuthorKeypair | undefined) => void
] {
  const { currentAuthor, setCurrentAuthor } = React.useContext(
    CurrentAuthorContext
  );

  return [currentAuthor, setCurrentAuthor];
}

export function useSync() {
  const { storages } = React.useContext(StorageContext);
  const { pubs } = React.useContext(PubsContext);

  return React.useCallback((address: string) => {
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
  }, []);
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
    [storages]
  );
}

export function useDocument(
  workspaceAddress: string,
  path: string
):
  | [
      Document | undefined,
      (content: string, deleteAfter?: number | null | undefined) => void,
      () => void
    ]
  | undefined {
  const { storages } = React.useContext(StorageContext);
  const [currentAuthor] = useCurrentAuthor();

  const storage = storages[workspaceAddress];

  if (!storage) {
    return undefined;
  }

  const document = storage.getDocument(path);

  const set = React.useCallback(
    (content: string, deleteAfter?: number | null | undefined) => {
      if (!currentAuthor) {
        console.warn('Tried to set a document when no current author was set.');
        return;
      }

      const docToSet: DocToSet = {
        format: 'es.4',
        path,
        content,
        deleteAfter,
      };

      storage.set(currentAuthor, docToSet);
    },
    [path, currentAuthor]
  );

  const deleteDoc = () => {
    set('');
  };

  return [document, set, deleteDoc];
}
