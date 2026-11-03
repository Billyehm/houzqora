'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchBookings, getCurrentUser, setPendingSlug, upsertBooking } from '@/lib/queries';
import Spinner from '@/components/Spinner';

export default function BookActions({ slug, title, city }: { slug: string; title: string; city: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'pay' | 'book' | null>(null);

  const ensureBooking = async () => {
    const user = await getCurrentUser();
    if (!user) {
      setPendingSlug(slug);
      router.push('/signup');
      return false;
    }
    const bookings = await fetchBookings(user.id);
    await upsertBooking(user.id, slug, bookings[slug] || { paid: false, slot: '' });
    return true;
  };

  const book = async () => {
    setBusy('book');
    try {
      if (await ensureBooking()) router.push('/bookings');
    } finally {
      setBusy(null);
    }
  };

  const pay = async () => {
    setBusy('pay');
    try {
      if (await ensureBooking()) router.push(`/checkout/${slug}`);
    } finally {
      setBusy(null);
    }
  };

  // The agents page builds the WhatsApp draft itself, so this
  // button only needs to carry the home along with it.
  const agentsHref = `/agents?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}&city=${encodeURIComponent(city)}`;

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={pay} disabled={busy !== null} className="btn-press flex items-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white shadow-[0_2px_0_rgba(230,59,78,0.3)] disabled:opacity-60">
        {busy === 'pay' && <Spinner />}Pay inspection fee
      </button>
      <button onClick={book} disabled={busy !== null} className="btn-press flex items-center gap-2 rounded-full bg-velvet px-5 py-3 font-bold text-white disabled:opacity-60">
        {busy === 'book' && <Spinner />}Book inspection
      </button>
      <Link href={agentsHref} className="btn-press rounded-full border border-white/40 px-5 py-3 font-bold text-white">Contact agent</Link>
    </div>
  );
}
