'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eur, type Property } from '@/lib/properties';
import { addMyHome, getDemoUser, getMyHomes, setMyHome } from '@/lib/demo';

export default function CheckoutClient({ p }: { p: Property }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getDemoUser());
    addMyHome(p.slug);
  }, [p.slug]);

  if (!loggedIn) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Please log in first</h2>
        <p className="mt-2 text-muted">Checkout needs a signed in account, even in this demo.</p>
        <a href="/login" className="btn-press mt-4 inline-block rounded-full bg-velvet px-5 py-3 font-bold text-white">Log in</a>
      </div>
    );
  }

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      const homes = getMyHomes();
      setMyHome(p.slug, { paid: true, slot: homes[p.slug]?.slot || '' });
      setProcessing(false);
      setDone(true);
    }, 800);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Demo inspection fee recorded</h2>
        <p className="mt-2 text-muted">No real money was taken. In the real build, this step would verify the payment with Mollie or Stripe with iDEAL, then send a confirmation email.</p>
        <p className="mt-3 text-sm">Next step: pick a viewing slot in My homes.</p>
        <button onClick={() => router.push('/my-homes')} className="btn-press mt-4 rounded-full bg-strawberry px-5 py-3 font-bold text-white">Go to My homes</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <p className="rounded-xl bg-cream p-3 text-sm text-muted">Demo checkout only. No real payment is taken here. Real Mollie or Stripe with iDEAL verification is a later stage.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex justify-between"><span>Monthly rent</span><b>{eur(p.rent)}</b></p>
        <p className="flex justify-between"><span>Inspection fee, non-refundable</span><b>{eur(p.fee)}</b></p>
        <p className="flex justify-between"><span>Remaining to secure, first month plus deposit</span><b>{eur(p.securing)}</b></p>
      </div>
      <p className="mt-4 text-sm text-muted">Paying the inspection fee does not reserve this home. It covers arranging and conducting your viewing.</p>
      <button onClick={pay} disabled={processing} className="btn-press mt-4 w-full rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
        {processing ? 'Processing demo payment...' : `Pay demo inspection fee ${eur(p.fee)}`}
      </button>
    </div>
  );
}
