import React from "react";
import { identicon } from "minidenticons";

export function Identicon(
  { address, salt, size }: {
    address: string;
    size: number;
    salt?: string;
  },
) {
  const svg = React.useMemo(() => {
    return identicon(`${address}${salt || ""}`);
  }, [address]);

  const withoutMargin = React.useMemo(() => {
    return svg.replace('viewBox="-1.5 -1.5 8 8"', 'viewBox="0 0 5 5"');
  }, [svg]);

  return (
    <img
      src={`data:image/svg+xml;utf8,${withoutMargin}`}
      width={size}
      height={size}
      alt={`An identicon representing the address ${address}`}
    />
  );
}
