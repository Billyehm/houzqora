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

// The discount's permanent home. Unlike the top banner, this card
// ignores a banner dismissal, so cancelling the ribbon never loses
// the offer. It stays here until the 7 day window ends, then it
// disappears and fees go back to full price.
export default function DiscountBookingsCard() {
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

  useEffect(() => {
    if (!userChecked) return;
    const existing = loadDiscount(userId);
    if (existing) {
      setState(existing);
      return;
    }
    const fresh: DiscountState = { startsAt: Date.now(), claimed: false };
    saveDiscount(userId, fresh);
    setState(fresh);
  }, [userChecked, userId]);

  useEffect(() => {
    const refresh = () => setState(loadDiscount(userId));
    window.addEventListener('houzqora-discount-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('houzqora-discount-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!state || isExpired(state, now)) return null;

  const claim = () => {
    const next = { ...state, claimed: true };
    saveDiscount(userId, next);
    setState(next);
    window.dispatchEvent(new Event('houzqora-discount-change'));
  };

  return (
    <div className="mt-4 rounded-2xl bg-velvet p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-strawberry px-3 py-1 text-xs font-extrabold">{DISCOUNT_PERCENT}% off</span>
            <span className="text-xl font-extrabold">{state.claimed ? 'Inspection discount active' : 'Discount alert'}</span>
          </p>
          <p className="mt-2 text-sm text-white/80">
            {state.claimed
              ? `Your inspection fees are ${DISCOUNT_PERCENT}% off, ends in ${formatCountdown(state, now)}`
              : `${DISCOUNT_PERCENT}% off inspection for new users, ends in ${formatCountdown(state, now)}`}
          </p>
        </div>
        {!state.claimed && (
          <button type="button" onClick={claim} className="btn-press rounded-full bg-strawberry px-5 py-2.5 text-sm font-bold text-white">
            Claim and use
          </button>
        )}
      </div>
    </div>
  );
}
