import * as React from 'react';
import { useId } from '@reach/auto-id';
import { EarthbarTabContext } from './contexts';

export default function EarthbarTab({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const id = useId();

  return (
    <EarthbarTabContext.Provider
      value={{
        id,
      }}
    >
      <div {...props}>{children}</div>
    </EarthbarTabContext.Provider>
  );
}
