import { Descendant } from '@reach/descendants';

export type TabDescendant = Descendant<HTMLButtonElement> & {
  disabled: boolean;
};

export type TabPanelDescendant = Descendant<HTMLDivElement>;
