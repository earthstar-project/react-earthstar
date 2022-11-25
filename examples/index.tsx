import * as React from "react";
import { render } from "react-dom";
import * as Earthstar from "earthstar";
import { ReplicaDriverWeb } from "earthstar/browser";
import { useAuthorSettings, useShareSettings, useReplica, ClientSettingsContext, useShareSecretSettings, AuthorLabel, ShareLabel } from "../src/index";

Earthstar.setLogLevel("example", 4);

const settings = new Earthstar.ClientSettings();

const { peer } = settings.getPeer({
  sync: false,
  onCreateReplica: (addr, secret) =>
   { 
     console.log('making', addr, secret)
     return  new Earthstar.Replica({
      driver: new ReplicaDriverWeb(addr),
      shareSecret: secret,
    })},
});

function ShareSwitcher({ currentShare, setCurrentShare }: {
  currentShare: string;
  setCurrentShare: (addr: string) => void;
}) {
  const [shares] = useShareSettings()

  return (
    <>
      {shares.map((share) => (
        <li key={share}>
        <label >
          <input
            type="radio"
            value={share}
            checked={currentShare === share}
            onChange={(e) => {
              setCurrentShare(e.target.value);
            }}
          />
          <ShareLabel address={share} />
        </label>
        </li>
      ))}
    </>
  );
}

function ShareAdder() {
  const [newShareName, setNewShareName] = React.useState("");
  
  const [, addShare] = useShareSettings();
  const [, addSecret] = useShareSecretSettings()

  return (
    <>
      <h2>Add share</h2>
      <input
        value={newShareName}
        onChange={(e) => setNewShareName(e.target.value)}
      />
      <button
        onClick={async () => {
          setNewShareName("");

          const keypair = await Earthstar.Crypto.generateShareKeypair(
            newShareName,
          );

          if (Earthstar.isErr(keypair)) {
            return;
          }

          addShare(keypair.shareAddress);
          
          console.log('add secret called')
          await addSecret(keypair.shareAddress, keypair.secret)
          
          console.log('add secret finished')
        }}
      >
        Add
      </button>
    </>
  );
}

function TinyApp({ replica }: { replica: Earthstar.Replica }) {
  const [author] = useAuthorSettings();

  const [doc] = useReplica(replica, (cache) => {
    return [cache.getLatestDocAtPath('/something')]
  });

  const [value, setValue] = React.useState("");

  return (
    <>
      <h2>Tiny app</h2>
      <dt>Content</dt>
      <dd>{`${doc?.text}`}</dd>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!author) {
            return;
          }
          setValue("");
          const res = await replica.set(author, {
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
  const [identity, setIdentity] = useAuthorSettings();

  React.useEffect(() => {
    Earthstar.Crypto.generateAuthorKeypair(
      "test",
    ).then((res) => {
      setIdentity(res as Earthstar.AuthorKeypair);
    });
  }, []);

  return (
    <>
      <h2>Identity</h2>
      { identity ? 
        <AuthorLabel address={identity.address} iconSize={10}/>
        : 'No identity'
      }

    </>
  );
}

function Example() {
  const [currentShare, setCurrentShare] = React.useState("");
  const [secrets] = useShareSecretSettings();
  
  console.log(secrets)

  const replica = peer.getReplica(currentShare);
  
  console.log('got replica...', replica)

  return (
    <ClientSettingsContext.Provider value={settings}>
      <h1>Example</h1>

      <CurrentIdentity />
      <ShareAdder />
      <ShareSwitcher
        currentShare={currentShare}
        setCurrentShare={setCurrentShare}
      />
      {replica ? <TinyApp replica={replica} /> : null}
        
      <button onClick={() => settings.clear()}>Clear</button>
    </ClientSettingsContext.Provider>
  );
  
  
}

render(<Example />, document.getElementById("root"));


