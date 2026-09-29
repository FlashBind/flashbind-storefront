import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useId} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);
  useBodyScrollLock(expanded);

  return (
    <div
      aria-modal
      className={`fixed inset-x-0 top-0 h-visible-screen z-40 transition-opacity duration-300 ${
        expanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-labelledby={id}
    >
      {/* Background Overlay */}
      <button 
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default" 
        onClick={close} 
        aria-label="Close overlay"
      />
      
      {/* Sliding Panel */}
      <aside 
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-100 shadow-2xl transition-transform duration-300 transform ${
          expanded ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col pt-[115px] md:pt-[124px]`}
      >

        <main className="flex-1 overflow-y-auto overscroll-contain p-6 bg-[#F8FAFC] text-slate-800">
          {children}
        </main>
      </aside>
    </div>
  );
}

/**
 * Stops the page behind an open overlay from scrolling, and restores it when
 * the overlay closes. Counted, so two overlays open at once don't unlock early.
 * Locks <html> as well as <body>: iOS Safari ignores overflow on <body> alone.
 */
let scrollLockCount = 0;
let savedOverflow: {html: string; body: string} | null = null;

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;
    if (scrollLockCount === 0) {
      savedOverflow = {html: html.style.overflow, body: body.style.overflow};
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    }
    scrollLockCount += 1;
    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0 && savedOverflow) {
        html.style.overflow = savedOverflow.html;
        body.style.overflow = savedOverflow.body;
        savedOverflow = null;
      }
    };
  }, [locked]);
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
