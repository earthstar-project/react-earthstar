import * as React from 'react';
import ReactDOM from 'react-dom';
import { useDescendant } from '@reach/descendants';
import {
  EarthbarContext,
  EarthbarTabContext,
  TabPanelDescendantContext,
} from './contexts';

export default function EarthbarTabPanel({
  children,
  ...rest
}: { children: React.ReactNode } & React.Attributes) {
  const { panelRef, activeIndex } = React.useContext(EarthbarContext);
  const { id } = React.useContext(EarthbarTabContext);
  const thisPanelRef = React.useRef(null);

  const index = useDescendant(
    {
      element: thisPanelRef.current,
    },
    TabPanelDescendantContext
  );

  return (
    <>
      <div ref={thisPanelRef} />
      {panelRef
        ? ReactDOM.createPortal(
            activeIndex === index ? (
              <div
                data-re-earthbar-panel
                aria-labelledby={`tab-${id}`}
                id={`panel-${id}`}
                role={'tabpanel'}
                tabIndex={0}
                onKeyDown={e => {
                  // We don't want keyboard events to propagate beyond the panel and into the the listener for tab navigation
                  e.stopPropagation();
                }}
                {...rest}
              >
                {children}
              </div>
            ) : null,
            panelRef
          )
        : null}
    </>
  );
}
