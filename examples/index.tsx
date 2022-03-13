import * as React from "react";
import { render } from "react-dom";
import { AuthorKeypair, Crypto, FormatValidatorEs4, Replica, setLogLevel } from "earthstar";
import { ReplicaDriverIndexedDB } from "earthstar/browser";
import { Peer, useIdentity, useCurrentShare, usePeer, useReplica } from "../src/index";

setLogLevel('example', 4)

function AppSwitcher() {
  const peer = usePeer()
  const [currentShare, setCurrentShare] = useCurrentShare();
  const shares = peer.shares();

  return <>
    {shares.map((share) =>

      <label key={share}><input type="radio" value={share} checked={currentShare === share} onChange={e => {
        setCurrentShare(e.target.value)
      }} />{share}</label>
    )}
  </>
}

function TinyApp() {
  const [identity] = useIdentity();
  const replica = useReplica();

  const doc = replica.getLatestDocAtPath('/something.txt');
  const [value, setValue] = React.useState('')

  return <>
    <h2>Tiny app</h2>
    <dt>Content</dt><dd>{`${doc?.content}`}</dd>
    <form onSubmit={async (e) => {
      console.log(replica._replica.getMaxLocalIndex())
      const docs = await replica._replica.getLatestDocs()

      console.log(docs.length)

      e.preventDefault();

      if (!identity) {
        return
      }
      setValue('')
      const res = await replica.set(identity, {
        content: value,
        path: '/something.txt',
        format: 'es.4'
      });

      console.log(res)
    }}>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <button type="submit">Update content</button>
    </form>
  </>
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
  const [currentShare] = useCurrentShare()

  return (
    <>
      <h2>Current shares</h2>
      <ul>{shares.map((share) => <li key={share}>{share === currentShare ? <b>{share}</b> : share}</li>)}</ul>
    </>
  );
}

function Example() {
  return (
    <>
      <h1>Example</h1>
      <Peer
        initShares={["+test.a123", '+test2.b234', '+test3.c345', "+plaza.prm27p8eg65c"]}
        initCurrentShare={"+plaza.prm27p8eg65c"}
        initReplicaServers={['wss://es-rs-1.fly.dev']}
        onCreateShare={(addr) =>
          new Replica(
            addr,
            FormatValidatorEs4,
            new ReplicaDriverIndexedDB(addr),
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
