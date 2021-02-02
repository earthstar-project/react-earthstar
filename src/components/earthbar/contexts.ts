import { createDescendantContext } from '@reach/descendants';
import * as React from 'react';
import { TabDescendant, TabPanelDescendant } from './types';

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

export const EarthbarTabContext = React.createContext<{
  id: string | undefined;
}>({ id: undefined });

export const TabButtonDescendantContext = createDescendantContext<
  TabDescendant
>('TabButtonDescendantContext');

export const TabPanelDescendantContext = createDescendantContext<
  TabPanelDescendant
>('TabButtonDescendantContext');
