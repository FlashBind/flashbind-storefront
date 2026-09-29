import {useEffect} from 'react';

/**
 * One scroll lock for every overlay (cart, search, account drawer, mobile
 * menu), so they all behave the same.
 *
 * overflow: hidden on <body> alone does not stop the page scrolling on
 * iPhones, so the page is pinned in place instead: <body> becomes
 * position: fixed, shifted up by the current scroll offset, and the scroll
 * position is restored when the last overlay closes. Only <body> is touched:
 * locking <html> as well makes <body> (overflow-x-hidden in root.tsx) its own
 * scroll box, and the sticky header then slides off the top of the screen.
 *
 * Counted, so two overlays open at once don't unlock early.
 */
type SavedPage = {
  scrollY: number;
  url: string;
  style: Pick<CSSStyleDeclaration, 'position' | 'top' | 'left' | 'right' | 'width' | 'overflow'>;
};

let lockCount = 0;
let saved: SavedPage | null = null;

function lockPage() {
  const body = document.body;
  const scrollY = window.scrollY;
  saved = {
    scrollY,
    url: window.location.href,
    style: {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    },
  };
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function unlockPage() {
  if (!saved) return;
  const {scrollY, url, style} = saved;
  saved = null;
  Object.assign(document.body.style, style);
  // Back to where the visitor was. Skipped when a link in the overlay has
  // already moved to another page, so the new page keeps its own position.
  // 'instant' because <html> has scroll-behavior: smooth (app.css).
  if (window.location.href === url) {
    window.scrollTo({top: scrollY, left: 0, behavior: 'instant'});
  }
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) lockPage();
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) unlockPage();
    };
  }, [locked]);
}
