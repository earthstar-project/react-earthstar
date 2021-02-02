import * as React from 'react';
import {
  DescendantProvider,
  useDescendantsInit,
  useDescendantKeyDown,
} from '@reach/descendants';
import { useEventCallback, isFunction } from '@reach/utils';
import WorkspaceTab from './WorkspaceTab';
import AuthorTab from './AuthorTab';
import {
  EarthbarContext,
  TabButtonDescendantContext,
  TabPanelDescendantContext,
} from './contexts';
import { TabDescendant, TabPanelDescendant } from './types';

export default function Earthbar({
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

export function Spacer() {
  return <div data-re-earthbar-spacer />;
}
