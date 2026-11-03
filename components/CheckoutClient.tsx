'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eur, type Property } from '@/lib/properties';
import { fetchBookings, getCurrentUser, upsertBooking, type AppUser } from '@/lib/queries';
import InspectionFee from '@/components/InspectionFee';
import Spinner from '@/components/Spinner';

export default function CheckoutClient({ p }: { p: Property }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const bookings = await fetchBookings(u.id);
        await upsertBooking(u.id, p.slug, bookings[p.slug] || { paid: false, slot: '' });
      }
      setChecked(true);
    })();
  }, [p.slug]);

  if (!checked) return <p className="mt-6 flex items-center gap-2"><Spinner />Loading checkout...</p>;

  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Please log in first</h2>
        <p className="mt-2 text-muted">Checkout needs a signed in account.</p>
        <a href="/login" className="btn-press mt-4 inline-block rounded-full bg-velvet px-5 py-3 font-bold text-white">Log in</a>
      </div>
    );
  }

  const confirm = async () => {
    setProcessing(true);
    const bookings = await fetchBookings(user.id);
    await upsertBooking(user.id, p.slug, { paid: true, slot: bookings[p.slug]?.slot || '' });
    setProcessing(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Inspection request recorded</h2>
        <p className="mt-2 text-muted">Your request for this home is saved in your bookings. Payment collection with Mollie or Stripe with iDEAL will be added next, and the agency will confirm the inspection fee step with you.</p>
        <p className="mt-3 text-sm">Next step: pick a viewing slot in Bookings.</p>
        <button onClick={() => router.push('/bookings')} className="btn-press mt-4 rounded-full bg-strawberry px-5 py-3 font-bold text-white">Go to Bookings</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex justify-between"><span>Monthly rent</span><b>{eur(p.rent)}</b></p>
        <p className="flex justify-between"><span>Inspection fee, non-refundable</span><b><InspectionFee fee={p.fee} /></b></p>
        <p className="flex justify-between"><span>Remaining to secure, first month plus deposit</span><b>{eur(p.securing)}</b></p>
      </div>
      <p className="mt-4 text-sm text-muted">Confirming the inspection does not reserve this home. It covers arranging and conducting your viewing.</p>
      <button onClick={confirm} disabled={processing} className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
        {processing && <Spinner />}
        {processing ? 'Recording...' : (<>Confirm inspection, fee <InspectionFee fee={p.fee} /></>)}
      </button>
    </div>
  );
}
