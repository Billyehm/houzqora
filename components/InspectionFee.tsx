'use client';

import { useEffect, useState } from 'react';
import { eur } from '@/lib/properties';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/queries';
import { DISCOUNT_PERCENT, discountedFee, fetchDiscountState, isDiscountActive } from '@/lib/discount';

// One display for the inspection fee everywhere it is shown, so a
// claimed discount slashes the price in the same way on cards, the
// detail page, checkout and bookings.
export default function InspectionFee({ fee }: { fee: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      getCurrentUser().then(async (u) => {
        if (cancelled) return;
        // Signed out users have no discount, only a generic advert.
        if (!u) {
          setActive(false);
          return;
        }
        const state = await fetchDiscountState(u.id);
        if (!cancelled) setActive(isDiscountActive(state, Date.now()));
      });
    };
    refresh();
    // Claim in the banner updates fees on the page already open too,
    // and login or logout switches between personal and no discount.
    window.addEventListener('houzqora-discount-change', refresh);
    window.addEventListener('storage', refresh);
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      cancelled = true;
      window.removeEventListener('houzqora-discount-change', refresh);
      window.removeEventListener('storage', refresh);
      data.subscription.unsubscribe();
    };
  }, []);

  if (!active) return <span>{eur(fee)}</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <s className="font-normal text-muted">{eur(fee)}</s>
      <span>{eur(discountedFee(fee))}</span>
      <span className="rounded-full bg-strawberry px-2 py-0.5 text-xs font-extrabold text-white">{DISCOUNT_PERCENT}% off</span>
    </span>
  );
}
