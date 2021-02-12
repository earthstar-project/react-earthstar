import * as React from 'react';

export default function Guidance({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details data-re-details>
      <summary data-re-summary>{title}</summary>
      <div data-re-details-content>{children}</div>
    </details>
  );
}
