'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/queries';
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
      <div className="sticky top-0 z-50 bg-velvet text-white">
        <div className={`mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
          <span className="font-extrabold">Discount alert</span>
          <span>{DISCOUNT_PERCENT}% inspection discount for 7 days</span>
          <Link href="/signup" className="btn-press rounded-full bg-strawberry px-4 py-1.5 text-sm font-bold text-white">Claim and use</Link>
          <button type="button" onClick={() => { setBannerDismissed(userId); setDismissed(true); }} aria-label="Close discount banner" className="btn-press rounded-full px-2 py-1 text-lg font-bold leading-none text-white/80">×</button>
        </div>
      </div>
    );
  }

  if (!state || isExpired(state, now)) return null;

  const claim = async () => {
    const next = await claimDiscountState(userId);
    if (next) setState(next);
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
    <div className="sticky top-0 z-50 bg-velvet text-white">
      <div className={`mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
        {state.claimed ? (
          <>
            <span className="rounded-full bg-strawberry px-3 py-1 text-xs font-extrabold">{DISCOUNT_PERCENT}% off active</span>
            <span className="font-bold">Inspection discount active, ends in {formatCountdown(state, now)}</span>
          </>
        ) : (
          <>
            <span className="font-extrabold">Discount alert</span>
            <span>{DISCOUNT_PERCENT}% off inspection for new users, ends in {formatCountdown(state, now)}</span>
            <button type="button" onClick={() => { void claim(); }} className="btn-press rounded-full bg-strawberry px-4 py-1.5 text-sm font-bold text-white">Claim and use</button>
          </>
        )}
        <button type="button" onClick={dismiss} aria-label="Close discount banner" className="btn-press rounded-full px-2 py-1 text-lg font-bold leading-none text-white/80">×</button>
      </div>
    </div>
  );
}
