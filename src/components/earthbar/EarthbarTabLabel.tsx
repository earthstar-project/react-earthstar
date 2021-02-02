import * as React from 'react';
import { useDescendant } from '@reach/descendants';
import {
  isFunction,
  useEventCallback,
  useUpdateEffect,
  wrapEvent,
} from '@reach/utils';
import {
  EarthbarContext,
  EarthbarTabContext,
  TabButtonDescendantContext,
} from './contexts';

export default function EarthbarTabLabel({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const { onFocus, onBlur } = rest;

  const { setActiveIndex, activeIndex } = React.useContext(EarthbarContext);
  const { id } = React.useContext(EarthbarTabContext);
  const { setFocusedIndex } = React.useContext(EarthbarContext);

  const ref = React.useRef<HTMLButtonElement | null>(null);

  const index = useDescendant(
    {
      element: ref.current,
      disabled: false,
    },
    TabButtonDescendantContext
  );

  const isSelected = activeIndex === index;

  useUpdateEffect(() => {
    if (isSelected && ref.current) {
      if (isFunction(ref.current.focus)) {
        ref.current.focus();
      }
    }
  }, [isSelected]);

  let handleFocus = useEventCallback(
    wrapEvent(onFocus, () => {
      setFocusedIndex(index);
    })
  );

  let handleBlur = useEventCallback(
    wrapEvent(onBlur, () => {
      setFocusedIndex(-1);
    })
  );

  const handleKeyDown = useEventCallback<React.KeyboardEvent>(event => {
    if (['Enter', 'Return', ' '].includes(event.key)) {
      event.preventDefault();
      setActiveIndex(prevActive => {
        return prevActive === index ? -1 : index;
      });
    }
  });

  return (
    <button
      ref={ref}
      role={'tab'}
      aria-selected={isSelected}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      data-re-earthbar-tab-label
      data-selected={isSelected}
      onClick={() => {
        setActiveIndex(prevIndex => (prevIndex === index ? -1 : index));
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected ? 0 : -1}
      {...rest}
    >
      {children}
    </button>
  );
}
