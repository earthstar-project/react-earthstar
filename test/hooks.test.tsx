import * as React from "react";
import {
  AuthorKeypair,
  Crypto,
  EarthstarError,
  isErr,
  Replica,
  ReplicaDriverMemory,
} from "earthstar";
import {
  act,
  renderHook,
  RenderHookResult,
} from "@testing-library/react-hooks";
import {
  LocalStorageSettingsWriter,
  Peer,
  useAddShare,
  useCurrentShare,
  useInvitation,
  useLocalStorageEarthstarSettings,
  useMakeInvitation,
  usePeer,
  useReplicaServers,
  useReplica,
} from "../src";
import { JSDOM } from "jsdom";

const dom = new JSDOM();
(global as any).window = dom.window;

const SHARE_ADDR_A = "+testa.a123";
const SHARE_ADDR_B = "+testb.b234";
const SHARE_ADDR_C = "+testc.c567";

const PUB_A = "https://a.pub";
const PUB_B = "https://b.pub";
const PUB_C = "https://c.pub";

const pubs = [PUB_A, PUB_B, PUB_C];

async function getKeypair() {
  const keypair = await Crypto.generateAuthorKeypair("onee") as AuthorKeypair;

  return keypair;
}

async function renderPeerHook<P, T>(
  arg: (props: P) => T,
): Promise<RenderHookResult<P, T>> {
  const keypair = await getKeypair();

  return renderHook(arg, {
    wrapper: ({ children }) => (
      <Peer
        initShares={[SHARE_ADDR_A, SHARE_ADDR_B, SHARE_ADDR_C]}
        initReplicaServers={pubs}
        initIdentity={keypair}
        initIsLive={false}
        initCurrentShare={SHARE_ADDR_A}
        onCreateShare={(shareAddress) => {
          return new Replica(
        { driver: 
          new ReplicaDriverMemory(shareAddress),
        }
     
          );
        }}
      >
        {children}
        <LocalStorageSettingsWriter storageKey={"tests"} />
      </Peer>
    ),
  });
}

test("usePubs", async () => {
  const { result } = await renderPeerHook(() => useReplicaServers());

  expect(result.current[0]).toEqual(pubs);

  act(() => {
    result.current[1]([PUB_C]);
  });

  expect(result.current[0]).toEqual([PUB_C]);
});

test("useAddShare", async () => {
  const useTest = () => {
    const add = useAddShare();
    const peer = usePeer();

    return { peer, add };
  };

  const { result } = await renderPeerHook(() => useTest());

  await act(async () => {
    await result.current.add("+good.a123");
  });

  expect(result.current.peer.hasShare("+good.a123")).toBeTruthy();

  act(() => {
    result.current.peer.removeReplicaByShare("+good.a123");
  });

  await act(async () => {
    await result.current.add("bad_name.2341");
  });

  expect(result.current.peer.hasShare("bad_name.2341")).toBeFalsy();
});

test("useCurrentShare", async () => {
  const { result } = await renderPeerHook(() => useCurrentShare());

  expect(result.current[0]).toEqual(SHARE_ADDR_A);

  act(() => {
    result.current[1](SHARE_ADDR_B);
  });

  expect(result.current[0]).toEqual(SHARE_ADDR_B);

  act(() => {
    result.current[1]("+somethingunknown.a123");
  });

  expect(result.current[0]).toEqual(null);
});

test("useReplica", async () => {
  const { result, waitForNextUpdate } = await renderPeerHook(() =>
    useReplica()
  );

  expect(result.current.getAllDocs()).toEqual([]);
  expect(result.current.getLatestDocAtPath("/storage-test/test"))
    .toBeUndefined();

  const keypair = await getKeypair();

  // Do not await the below. It'll make this test break.
  act(async () => {
   await result.current.set(keypair, {
      path: "/storage-test/test",
      text: "Hello world!",
    });
  });

  await waitForNextUpdate();

  expect(result.current.getLatestDocAtPath("/storage-test/test")?.text)
    .toEqual(
      "Hello world!",
    );

  expect(result.current.getAllDocs().length).toEqual(1);

  const query = { filter: { pathStartsWith: `/storage-test` } };

  expect(result.current.queryDocs(query)).toEqual([]);

  await waitForNextUpdate();

  expect(result.current.queryDocs(query)[0].text).toEqual("Hello world!");
});

test("useInvitation", async () => {
  const VALID_URL =
    "earthstar:///?workspace=+gardening.abc&pub=http://pub1.org&pub=https://pub2.org&v=1";

  const useTest = () => {
    const [code, setCode] = React.useState(VALID_URL);
    const invitationResult = useInvitation(code);

    return { invitationResult, setCode };
  };

  const { result } = await renderPeerHook(() => useTest());

  expect(isErr(result.current.invitationResult)).toBeFalsy();

  act(() => result.current.setCode("http://dogs.com"));

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    "Invitation not a valid Earthstar URL",
  );

  act(() =>
    result.current.setCode(
      "earthstar:///?workspace=+gardening.abc&pub=http://pub1.org&pub=https://pub2.org&v=46",
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    "Unrecognised Earthstar invitation format version",
  );

  act(() =>
    result.current.setCode(
      "earthstar:///?pub=http://pub1.org&pub=https://pub2.org&v=1",
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    "No workspace found in Earthstar invitation URL",
  );

  act(() =>
    result.current.setCode(
      "earthstar:///?workspace=+gardening.abc&pub=blorp&v=1",
    )
  );

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    "Malformed Pub URL found",
  );

  act(() => result.current.setCode("bong"));

  expect((result.current.invitationResult as EarthstarError).message).toEqual(
    "Not a valid Earthstar URL",
  );
});

test("useMakeInvitation", async () => {
  const useTest = () => {
    const [workspace, setWorkspace] = React.useState(SHARE_ADDR_A);
    const [includedPubs, setIncludedPubs] = React.useState<string[]>([PUB_A]);
    const invitationCode = useMakeInvitation(includedPubs, workspace);

    return { setWorkspace, setIncludedPubs, invitationCode };
  };

  const { result } = await renderPeerHook(() => useTest());

  expect(result.current.invitationCode).toEqual(
    "earthstar:///?workspace=+testa.a123&pub=https://a.pub&v=1",
  );

  act(() => {
    result.current.setIncludedPubs([]);
  });

  expect(result.current.invitationCode).toEqual(
    "earthstar:///?workspace=+testa.a123&v=1",
  );
});

test("useLocalStorageSettings", async () => {
  const useTest = () => {
    const settings = useLocalStorageEarthstarSettings("tests");
    const add = useAddShare();

    return { settings, add };
  };

  const { result } = await renderPeerHook(
    () => useTest(),
  );

  expect(result.current.settings.initShares).toHaveLength(3);
  expect(result.current.settings.initReplicaServers).toEqual([PUB_A, PUB_B, PUB_C]);
  expect(result.current.settings.initIdentity).toBeDefined();
  expect(result.current.settings.initCurrentShare).toBe(SHARE_ADDR_A);
});
