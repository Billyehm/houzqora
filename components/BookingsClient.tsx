'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { eur } from '@/lib/properties';
import { fetchBookings, fetchAllProperties, getCurrentUser, upsertBooking, type AppUser, type BookingState } from '@/lib/queries';
import Spinner from '@/components/Spinner';
import AgentLink from './AgentLink';
import InspectionFee from '@/components/InspectionFee';
import DiscountBookingsCard from '@/components/DiscountBookingsCard';
import type { Property } from '@/lib/properties';

export default function BookingsClient() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [homes, setHomes] = useState<Record<string, BookingState>>({});
  const [picking, setPicking] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setAllProperties(await fetchAllProperties());
      if (u) setHomes(await fetchBookings(u.id));
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return <p className="mt-6">Loading bookings...</p>;

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h1 className="text-xl font-extrabold text-velvet">Please log in</h1>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="btn-press rounded-full bg-velvet px-5 py-3 font-bold text-white">Log in</Link>
          <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-3 font-bold text-white">Sign up</Link>
        </div>
      </div>
    );
  }

  // Active bookings only: a fee paid, or a viewing scheduled.
  const entries = Object.entries(homes).filter(([, state]) => state.paid || state.slot);

  const pickSlot = async (slug: string, slot: string) => {
    setPicking(`${slug}:${slot}`);
    const next = { ...homes[slug], slot };
    setHomes((h) => ({ ...h, [slug]: next }));
    if (user) await upsertBooking(user.id, slug, next);
    setPicking(null);
  };

  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Bookings</h1>
      <DiscountBookingsCard />
      {entries.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-extrabold text-velvet">No active bookings</h2>
          <Link href="/dashboard" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Dashboard</Link>
        </div>
      ) : entries.map(([slug, state]) => {
        const p = allProperties.find((x) => x.slug === slug);
        if (!p) return null;
        const status = state.slot ? 'Viewing scheduled' : 'Inspection requested';
        return (
          <article key={slug} className="mt-4 grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[110px_1fr_auto]">
            <div className="relative h-24 w-full overflow-hidden rounded-xl sm:h-[90px] sm:w-[110px]">
              <Image src={p.images[0]} alt={p.title} fill sizes="110px" className="object-cover" />
            </div>
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-sm text-muted">{p.city} · {eur(p.rent)} / month · Inspection <InspectionFee fee={p.fee} /> · To secure {eur(p.securing)}</p>
              <p className="mt-2"><span className="rounded-full bg-[#FFF0EF] px-3 py-1 text-xs font-extrabold text-velvet">{status}</span></p>
              <p className="mt-2 text-sm font-bold text-velvet">Next: {state.slot ? `Viewing: ${state.slot}` : 'Viewing slot'}</p>
              {state.paid && !state.slot && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Thu 10:00', 'Fri 14:30', 'Sat 11:00'].map((s) => (
                    <button key={s} onClick={() => pickSlot(slug, s)} disabled={picking !== null} className="btn-press flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm font-bold disabled:opacity-60">{picking === `${slug}:${s}` && <Spinner className="h-3.5 w-3.5" />}{s}</button>
                  ))}
                </div>
              )}
            </div>
            <div>
              {state.paid && <p className="text-sm font-extrabold text-green-700">Request recorded</p>}
              <div className="mt-2"><AgentLink href={`/agents?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(p.title)}&city=${encodeURIComponent(p.city)}`} className="btn-press inline-block rounded-full border border-line px-4 py-2 text-sm font-bold text-velvet">Message agency</AgentLink></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
