'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/queries';
import Spinner from '@/components/Spinner';
import {
  DISCOUNT_PERCENT,
  claimDiscountState,
  fetchDiscountState,
  formatCountdown,
  isBannerDismissed,
  isExpired,
  setBannerDismissed,
  type DiscountState,
} from '@/lib/discount';

export default function DiscountBanner() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [userChecked, setUserChecked] = useState(false);
  const [state, setState] = useState<DiscountState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Re-check on login and logout, because the banner lives in the
  // layout and does not remount when auth changes. Signed out it
  // shows the generic advert, signed in it shows the personal
  // discount linked to that account.
  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      setUserId(u ? u.id : null);
      setUserChecked(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserChecked(true);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userChecked) return;
    setDismissed(isBannerDismissed(userId));
    if (!userId) {
      setState(null);
      return;
    }
    let cancelled = false;
    fetchDiscountState(userId).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => { cancelled = true; };
  }, [userChecked, userId]);

  // Tell the scroll cards when the ribbon appears, disappears, or
  // switches, so their pin positions re-measure instead of sitting
  // at a stale height and covering the header.
  useEffect(() => {
    if (!userChecked) return;
    window.dispatchEvent(new Event('houzqora-banner-change'));
  }, [userChecked, dismissed, userId, state]);

  // Tick the countdown every second.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // On login and signup the form is a narrow centred column, so the
  // banner narrows to that same column instead of stretching wide.
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (!userChecked || dismissed) return null;

  // Signed out: no user to link a discount to, so this is only a
  // generic advert for the 7 day offer. Claiming it goes to signup,
  // where a personal discount linked to the new account starts.
  if (!userId) {
    return (
      <div className="bg-velvet text-white">
        <div className={`mx-auto flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:gap-3 sm:px-6 sm:text-sm ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
          <span className="hidden shrink-0 whitespace-nowrap font-extrabold sm:inline">Discount alert</span>
          <span className="min-w-0 truncate">{DISCOUNT_PERCENT}% inspection discount for 7 days</span>
          <Link href="/signup" className="btn-press shrink-0 whitespace-nowrap rounded-full bg-strawberry px-3 py-1 text-xs font-bold text-white sm:px-4 sm:py-1.5 sm:text-sm">Claim and use</Link>
          <button type="button" onClick={() => { setBannerDismissed(userId); setDismissed(true); }} aria-label="Close discount banner" className="btn-press shrink-0 rounded-full px-1 py-1 text-base font-bold leading-none text-white/80 sm:px-2 sm:text-lg">×</button>
        </div>
      </div>
    );
  }

  if (!state || isExpired(state, now)) return null;

  const claim = async () => {
    setClaiming(true);
    try {
      const next = await claimDiscountState(userId);
      if (next) setState(next);
    } finally {
      setClaiming(false);
    }
    window.dispatchEvent(new Event('houzqora-discount-change'));
  };

  // Session only: closing the tab and coming back later shows the
  // banner again, and the offer stays in Bookings until it expires.
  const dismiss = () => {
    setBannerDismissed(userId);
    setDismissed(true);
    window.dispatchEvent(new Event('houzqora-discount-change'));
  };

  return (
    <div className="bg-velvet text-white">
      <div className={`mx-auto flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:gap-3 sm:px-6 sm:text-sm ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
        {state.claimed ? (
          <>
            <span className="shrink-0 whitespace-nowrap rounded-full bg-strawberry px-2 py-1 text-xs font-extrabold sm:px-3">{DISCOUNT_PERCENT}% off active</span>
            <span className="min-w-0 truncate font-bold">Inspection discount active, ends in {formatCountdown(state, now)}</span>
          </>
        ) : (
          <>
            <span className="hidden shrink-0 whitespace-nowrap font-extrabold sm:inline">Discount alert</span>
            <span className="min-w-0 truncate">{DISCOUNT_PERCENT}% off inspections, ends in {formatCountdown(state, now)}</span>
            <button type="button" onClick={() => { void claim(); }} disabled={claiming} className="btn-press flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-strawberry px-3 py-1 text-xs font-bold text-white disabled:opacity-60 sm:px-4 sm:py-1.5 sm:text-sm">{claiming && <Spinner className="h-3 w-3" />}Claim and use</button>
          </>
        )}
        <button type="button" onClick={dismiss} aria-label="Close discount banner" className="btn-press shrink-0 rounded-full px-1 py-1 text-base font-bold leading-none text-white/80 sm:px-2 sm:text-lg">×</button>
      </div>
    </div>
  );
}
