import React from 'react';
import ReactDOM from 'react-dom';
import {
  createDescendantContext,
  DescendantProvider,
  useDescendantsInit,
  useDescendant,
  useDescendantKeyDown,
  Descendant,
} from '@reach/descendants';
import { useId } from '@reach/auto-id';
import {
  useEventCallback,
  wrapEvent,
  useUpdateEffect,
  isFunction,
} from '@reach/utils';
import WorkspaceTab from './WorkspaceTab';
import AuthorTab from './AuthorTab';

type TabDescendant = Descendant<HTMLButtonElement> & {
  disabled: boolean;
};

type TabPanelDescendant = Descendant<HTMLDivElement>;

const TabButtonDescendantContext = createDescendantContext<TabDescendant>(
  'TabButtonDescendantContext'
);

const TabPanelDescendantContext = createDescendantContext<TabPanelDescendant>(
  'TabButtonDescendantContext'
);

export const EarthbarContext = React.createContext<{
  panelRef: HTMLDivElement | undefined;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}>({
  panelRef: undefined,
  activeIndex: -1,
  setActiveIndex: () => {},
  focusedIndex: -1,
  setFocusedIndex: () => {},
});

const EarthbarTabContext = React.createContext<{
  id: string | undefined;
}>({ id: undefined });

export function Earthbar({
  children = (
    <>
      <WorkspaceTab />
      <Spacer />
      <AuthorTab />
    </>
  ),
}: {
  children?: React.ReactNode;
}) {
  const [tabs, setTabs] = useDescendantsInit<TabDescendant>();
  const [panels, setPanels] = useDescendantsInit<TabPanelDescendant>();
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [panelRef, setPanelRef] = React.useState<HTMLDivElement | undefined>();

  return (
    <div data-re-earthbar>
      <DescendantProvider
        context={TabButtonDescendantContext}
        items={tabs}
        set={setTabs}
      >
        <DescendantProvider
          context={TabPanelDescendantContext}
          items={panels}
          set={setPanels}
        >
          <EarthbarContext.Provider
            value={{
              panelRef,
              activeIndex,
              setActiveIndex,
              focusedIndex,
              setFocusedIndex,
            }}
          >
            <EarthbarTabs>{children}</EarthbarTabs>
            <div
              data-re-earthbar-panel-portal
              ref={inst => {
                if (inst) {
                  setPanelRef(inst);
                }
              }}
            />
          </EarthbarContext.Provider>
        </DescendantProvider>
      </DescendantProvider>
    </div>
  );
}

function EarthbarTabs({ children }: { children: React.ReactNode }) {
  const { focusedIndex } = React.useContext(EarthbarContext);
  const { descendants: tabs } = React.useContext(TabButtonDescendantContext);

  const handleKeyDown = useEventCallback(
    useDescendantKeyDown(TabButtonDescendantContext, {
      currentIndex: focusedIndex,
      orientation: 'horizontal',
      rotate: true,
      callback: (index: number) => {
        const tabElement = tabs[index] && tabs[index].element;
        if (tabElement && isFunction(tabElement.focus)) {
          tabElement.focus();
        }
      },
      rtl: false,
    })
  );

  return (
    <div
      data-re-earthbar-tabs
      role={'tablist'}
      aria-orientation={'horizontal'}
      onKeyDown={event => {
        handleKeyDown(event);
      }}
    >
      {children}
    </div>
  );
}

export function EarthbarTab({
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

export function EarthbarTabLabel({
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

export function EarthbarTabPanel({
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

export function Spacer() {
  return <div data-re-earthbar-spacer />;
}
