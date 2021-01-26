import * as React from 'react';

export default function({
  children,
  copyValue,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  copyValue: any;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      data-re-button
      {...props}
      onClick={e => {
        if (onClick) {
          onClick(e);
        }

        navigator.clipboard.writeText(copyValue);
        setCopied(true);
      }}
    >
      {copied ? 'Copied!' : children || 'Copy'}
    </button>
  );
}
