'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/queries';
import {
  DISCOUNT_PERCENT,
  formatCountdown,
  isExpired,
  loadDiscount,
  saveDiscount,
  type DiscountState,
} from '@/lib/discount';

export default function DiscountBanner() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userChecked, setUserChecked] = useState(false);
  const [state, setState] = useState<DiscountState | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      setUserId(u ? u.id : null);
      setUserChecked(true);
    });
    return () => { cancelled = true; };
  }, []);

  // First sight for this user starts the 7 day window.
  useEffect(() => {
    if (!userChecked) return;
    const existing = loadDiscount(userId);
    if (existing) {
      setState(existing);
      return;
    }
    const fresh: DiscountState = { startsAt: Date.now(), claimed: false, dismissed: false };
    saveDiscount(userId, fresh);
    setState(fresh);
  }, [userChecked, userId]);

  // Tick the countdown every second.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!state || state.dismissed || isExpired(state, now)) return null;

  const claim = () => {
    const next = { ...state, claimed: true };
    saveDiscount(userId, next);
    setState(next);
    window.dispatchEvent(new Event('houzqora-discount-change'));
  };

  const dismiss = () => {
    const next = { ...state, dismissed: true };
    saveDiscount(userId, next);
    setState(next);
    window.dispatchEvent(new Event('houzqora-discount-change'));
  };

  return (
    <div className="sticky top-0 z-50 bg-velvet text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm sm:px-6">
        {state.claimed ? (
          <>
            <span className="rounded-full bg-strawberry px-3 py-1 text-xs font-extrabold">{DISCOUNT_PERCENT}% off active</span>
            <span className="font-bold">Inspection discount active, ends in {formatCountdown(state, now)}</span>
          </>
        ) : (
          <>
            <span className="font-extrabold">Discount alert</span>
            <span>{DISCOUNT_PERCENT}% off inspection for new users, ends in {formatCountdown(state, now)}</span>
            <button type="button" onClick={claim} className="btn-press rounded-full bg-strawberry px-4 py-1.5 text-sm font-bold text-white">Claim and use</button>
          </>
        )}
        <button type="button" onClick={dismiss} aria-label="Close discount banner" className="btn-press rounded-full px-2 py-1 text-lg font-bold leading-none text-white/80">×</button>
      </div>
    </div>
  );
}
