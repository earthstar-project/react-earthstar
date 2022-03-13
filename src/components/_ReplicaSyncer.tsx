import * as React from "react";
import { useIsLive, usePeer } from "../hooks";

export function ReplicaSyncer({ pubUrl }: { pubUrl: string }) {
  const [isLive] = useIsLive();
  const peer = usePeer();

  React.useEffect(() => {
    if (isLive) {
      const unsub = peer.sync(pubUrl);
      return () => {
        unsub();
      };
    }

    return () => {
    };
  }, [peer, isLive, pubUrl]);

  return null;
}
