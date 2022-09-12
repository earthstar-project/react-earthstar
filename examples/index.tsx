import * as React from "react";
import { render } from "react-dom";
import { AuthorKeypair, Crypto, Replica, setLogLevel } from "earthstar";
import {
  ReplicaDriverWeb,
} from "earthstar/browser";
import {
  Peer,
  useCurrentShare,
  useIdentity,
  usePeer,
  useReplica,
} from "../src/index";

setLogLevel("example", 4);

function AppSwitcher() {
  const peer = usePeer();
  const [currentShare, setCurrentShare] = useCurrentShare();
  const shares = peer.shares();

  return (
    <>
      {shares.map((share) => (
        <label key={share}>
          <input
            type="radio"
            value={share}
            checked={currentShare === share}
            onChange={(e) => {
              setCurrentShare(e.target.value);
            }}
          />
          {share}
        </label>
      ))}
    </>
  );
}

function TinyApp() {
  const [identity] = useIdentity();
  const replica = useReplica();

  const doc = replica.getLatestDocAtPath("/something");
  const [value, setValue] = React.useState("");

  return (
    <>
      <h2>Tiny app</h2>
      <dt>Content</dt>
      <dd>{`${doc?.text}`}</dd>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          


          

          if (!identity) {
            return;
          }
          setValue("");
          const res = await replica.set(identity, {
            text: value,
            path: "/something",
          });

          console.log(res);
        }}
      >
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="submit">Update content</button>
      </form>
    </>
  );
}

function CurrentIdentity() {
  const [identity, setIdentity] = useIdentity();

  React.useEffect(() => {
    Crypto.generateAuthorKeypair(
      "test",
    ).then((res) => {
      setIdentity(res as AuthorKeypair);
    });
  }, []);

  return (
    <>
      <h2>Identity</h2>
      <p>{identity?.address}</p>
    </>
  );
}

function ShareList() {
  const peer = usePeer();
  const shares = peer.shares();
  const [currentShare] = useCurrentShare();

  return (
    <>
      <h2>Current shares</h2>
      <ul>
        {shares.map((share) => (
          <li key={share}>{share === currentShare ? <b>{share}</b> : share}</li>
        ))}
      </ul>
    </>
  );
}

function Example() {
  return (
    <>
      <h1>Example</h1>
      <Peer
        initShares={["+test.a123", "+test2.b234", "+test3.c345", "+testmd.l486y00foopo",]}
        initCurrentShare="+test.a123"
        initReplicaServers={["https://es-rs-squirrel.fly.dev/sync"]}
        onCreateShare={(addr) =>
          new Replica(
            { driver: new ReplicaDriverWeb(addr) },
          )}
      >
        <CurrentIdentity />
        <AppSwitcher />
        <ShareList />
        <TinyApp />
      </Peer>
    </>
  );
}

render(<Example />, document.getElementById("root"));
