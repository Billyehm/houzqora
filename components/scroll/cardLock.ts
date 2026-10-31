'use client';

/*
 * cardLock: a true page lock for one animation card.
 *
 * Why the old pin was not enough: GSAP pin fixed only the card element.
 * The browser scroll position still advanced through the pin distance,
 * the section around the card still moved, and a fast wheel or trackpad
 * swipe could run straight through the whole pin distance in one gesture,
 * so the animation flashed by and the page moved on. To William that
 * reads as the full page moving while the animation is still ongoing.
 *
 * How this lock works instead:
 * - The card timeline is paused, not scrubbed by native scroll.
 * - Normal scrolling runs until the card top crosses the lock line,
 *   12 percent down the viewport, in either direction. At that moment
 *   the page is snapped so the card top sits exactly on the lock line,
 *   and the lock engages.
 * - While locked, wheel, touch swipe and arrow / page keys are
 *   intercepted (with passive: false, so preventDefault works) and
 *   their delta is turned into timeline progress. The page scroll
 *   position does not move at all, so nothing else on the page moves.
 *   The scrollbar thumbs are part of the same timeline, so they move
 *   in sync with the animation, as before.
 * - The lock releases only at an end, in the direction of travel:
 *   progress 1 while scrolling down, or progress 0 while scrolling up.
 *   The scroll that reaches the end is consumed; the next scroll moves
 *   the page normally. Reversing direction at an end also releases, so
 *   the user is never stuck: at progress 0 a scroll up releases, and
 *   at progress 1 a scroll down releases.
 * - A jump releases too: clicking a link, pressing Home, End or Tab,
 *   or dragging the scrollbar a long way releases the lock instead of
 *   trapping the user, and the timeline is set to the end that matches
 *   the jump direction (1 if the jump went down past the card, 0 if up).
 * - Only one card can hold the lock at a time, so two cards can never
 *   fight over wheel events, and fast scrolling cannot skip a card:
 *   a fast swipe while locked only advances progress by its delta,
 *   clamped to 0 to 1, and the page stays still until progress hits 1.
 * - No timers, no setInterval, no autoplay. Only CSS transforms, via
 *   the GSAP timeline, move anything.
 * - Reduced motion never reaches this code: callers return early and
 *   show static final states with normal page scrolling.
 */

import gsap from 'gsap';

type Timeline = gsap.core.Timeline;

let activeLockId: string | null = null;

const EPS = 0.001;
const LOCK_TOP_RATIO = 0.12;

export function attachCardLock(
  card: HTMLElement,
  tl: Timeline,
  multiplier: () => number,
  id: string,
): () => void {
  let locked = false;
  let lockScrollY = 0;
  let lastScrollY = window.scrollY;
  let prevTop = card.getBoundingClientRect().top;
  let lastTouchY: number | null = null;

  const lockTop = () => window.innerHeight * LOCK_TOP_RATIO;

  // Initial state for a page loaded or refreshed mid-page: a card the
  // user has already scrolled past is finished, one not yet reached
  // is at the start. This keeps scrolling up into a passed card sane.
  if (card.getBoundingClientRect().top < lockTop()) {
    tl.progress(1);
  } else {
    tl.progress(0);
  }

  const pinDistance = () => Math.max(1, card.offsetHeight * multiplier());

  const release = () => {
    if (!locked) return;
    locked = false;
    if (activeLockId === id) activeLockId = null;
    window.removeEventListener('wheel', onWheel, { capture: true } as AddEventListenerOptions);
    window.removeEventListener('touchstart', onTouchStart, { capture: true } as AddEventListenerOptions);
    window.removeEventListener('touchmove', onTouchMove, { capture: true } as AddEventListenerOptions);
    window.removeEventListener('keydown', onKeyDown, { capture: true } as AddEventListenerOptions);
    window.removeEventListener('click', onClick, { capture: true } as AddEventListenerOptions);
  };

  const engage = (rectTop: number) => {
    if (locked || activeLockId !== null) return;
    locked = true;
    activeLockId = id;
    lockScrollY = window.scrollY + (rectTop - lockTop());
    if (Math.abs(window.scrollY - lockScrollY) > 0.5) {
      window.scrollTo(0, lockScrollY);
    }
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('click', onClick, { capture: true });
  };

  const advance = (deltaPx: number) => {
    if (!locked || deltaPx === 0) return;
    const next = Math.min(1, Math.max(0, tl.progress() + deltaPx / pinDistance()));
    tl.progress(next);
    if ((deltaPx > 0 && next >= 1 - EPS) || (deltaPx < 0 && next <= EPS)) {
      tl.progress(deltaPx > 0 ? 1 : 0);
      release();
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    advance(delta);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (!locked) return;
    lastTouchY = e.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    const y = e.touches[0]?.clientY;
    if (y === undefined || lastTouchY === null) return;
    const delta = lastTouchY - y;
    lastTouchY = y;
    advance(delta);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!locked) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const step = pinDistance() * 0.15;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      if (tl.progress() >= 1 - EPS) {
        release();
        return;
      }
      e.preventDefault();
      advance(step);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      if (tl.progress() <= EPS) {
        release();
        return;
      }
      e.preventDefault();
      advance(-step);
    } else if (e.key === 'Home' || e.key === 'End' || e.key === 'Tab' || e.key === 'Escape') {
      release();
    }
  };

  const onClick = (e: MouseEvent) => {
    if (!locked) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest('a')) release();
  };

  const onScroll = () => {
    const scrollY = window.scrollY;
    const rectTop = card.getBoundingClientRect().top;
    const direction = scrollY - lastScrollY;
    if (locked) {
      // A scroll change while locked can only come from a jump the
      // wheel and touch handlers did not make, such as a scrollbar
      // drag or an anchor jump. Release instead of trapping the user,
      // and set the animation to the end matching the jump direction.
      if (Math.abs(scrollY - lockScrollY) > 2) {
        const past = scrollY > lockScrollY;
        release();
        tl.progress(past ? 1 : 0);
      }
      lastScrollY = scrollY;
      prevTop = rectTop;
      return;
    }
    if (activeLockId !== null) {
      lastScrollY = scrollY;
      prevTop = rectTop;
      return;
    }
    const top = lockTop();
    const progress = tl.progress();
    if (direction > 0 && prevTop > top && rectTop <= top && progress < 1 - EPS) {
      engage(rectTop);
    } else if (direction < 0 && prevTop < top && rectTop >= top && progress > EPS) {
      engage(rectTop);
    }
    lastScrollY = scrollY;
    prevTop = rectTop;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    release();
    window.removeEventListener('scroll', onScroll);
  };
}
