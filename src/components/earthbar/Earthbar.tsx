import React from 'react';
import ReactDOM from 'react-dom';
import {
  createDescendantContext,
  DescendantProvider,
  useDescendantsInit,
  useDescendant,
} from '@reach/descendants';

const DescendantContext = createDescendantContext('DescendantContext');
const EarthbarContext = React.createContext<{
  panelRef: HTMLDivElement | undefined;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}>({
  panelRef: undefined,
  activeIndex: -1,
  setActiveIndex: () => {},
});
const EarthbarTabContext = React.createContext<{
  setIsSelected: () => void;
  isSelected: boolean;
}>({ setIsSelected: () => {}, isSelected: false });

export function Earthbar({ children }: { children: React.ReactNode }) {
  const [descendants, setDescendants] = useDescendantsInit();
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [panelRef, setPanelRef] = React.useState<HTMLDivElement | undefined>();

  return (
    <div data-react-earthstar-earthbar>
      <DescendantProvider
        context={DescendantContext}
        items={descendants}
        set={setDescendants}
      >
        <EarthbarContext.Provider
          value={{ panelRef, activeIndex, setActiveIndex }}
        >
          <div data-react-earthstar-earthbar-tabs>{children}</div>
          <hr />
          <div
            data-react-earthstar-earthbar-panel
            ref={inst => {
              if (inst) {
                setPanelRef(inst);
              }
            }}
          />
        </EarthbarContext.Provider>
      </DescendantProvider>
    </div>
  );
}

export function EarthbarTab({ children }: { children: React.ReactNode }) {
  const { activeIndex, setActiveIndex } = React.useContext(EarthbarContext);

  const ref = React.useRef(null);
  const index = useDescendant(
    {
      element: ref.current,
    },
    DescendantContext
  );

  const isSelected = activeIndex === index;

  return (
    <EarthbarTabContext.Provider
      value={{
        isSelected,
        setIsSelected: () => {
          setActiveIndex(index);
        },
      }}
    >
      <div ref={ref} data-react-earthstar-earthbar-tab>
        {children}
      </div>
    </EarthbarTabContext.Provider>
  );
}

export function EarthbarButton({
  children,
  ...rest
}: { children: React.ReactNode } & React.Attributes) {
  // todo: find out how to link with panel a11y
  const { setIsSelected, isSelected } = React.useContext(EarthbarTabContext);

  return (
    <button
      disabled={isSelected}
      data-react-earthstar-earthbar-button
      onClick={setIsSelected}
      {...rest}
    >
      {children}
    </button>
  );
}

export function EarthbarPanel({
  children,
  ...rest
}: { children: React.ReactNode } & React.Attributes) {
  // todo: find out how to link with button a11y
  const { panelRef } = React.useContext(EarthbarContext);
  const { isSelected } = React.useContext(EarthbarTabContext);

  return panelRef
    ? ReactDOM.createPortal(
        isSelected ? (
          <div data-react-earthstar-earthbar-panel {...rest}>
            {children}
          </div>
        ) : null,
        panelRef
      )
    : null;
}

export function Spacer() {
  return <div data-react-earthstar-earthbar-spacer />;
}
