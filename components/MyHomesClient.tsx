'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eur, getProperty } from '@/lib/properties';
import { clearDemoUser, getDemoUser, getMyHomes, setMyHome, type DemoUser, type MyHomeState } from '@/lib/demo';

export default function MyHomesClient() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [homes, setHomes] = useState<Record<string, MyHomeState>>({});
  const [loaded, setLoaded] = useState(false);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    setUser(getDemoUser());
    setHomes(getMyHomes());
    setLoaded(true);
  }, []);

  if (!loaded) return <p className="mt-6">Loading your homes...</p>;

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Please log in first</h2>
        <p className="mt-2 text-muted">My homes is for signed in visitors.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="btn-press rounded-full bg-velvet px-5 py-3 font-bold text-white">Log in</Link>
          <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-3 font-bold text-white">Sign up</Link>
        </div>
      </div>
    );
  }

  const entries = Object.entries(homes);

  const pickSlot = (slug: string, slot: string) => {
    const next = { ...homes[slug], slot };
    setMyHome(slug, next);
    setHomes((h) => ({ ...h, [slug]: next }));
    setBanner(`Viewing slot saved: ${slot}. In the real build, this would be confirmed by email.`);
  };

  return (
    <div>
      <p className="mt-4 rounded-xl bg-cream p-3 text-sm text-muted">Demo account only in this stage. No real payment or email is created yet.</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-velvet">My homes</h1>
        <button onClick={() => { clearDemoUser(); router.push('/'); }} className="btn-press rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-velvet">Sign out</button>
      </div>
      <p className="mt-2 text-muted">No adverts here. Just the homes you are working on, what is paid, and what is next.</p>
      {banner && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm">{banner}</p>}
      {entries.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <p>You have no homes yet.</p>
          <Link href="/browse" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Go to Welcome browse homes</Link>
        </div>
      ) : entries.map(([slug, state]) => {
        const p = getProperty(slug);
        if (!p) return null;
        const status = state.slot ? 'Viewing scheduled' : state.paid ? 'Fee paid, pick a viewing' : 'Fee pending';
        return (
          <article key={slug} className="mt-4 grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[110px_1fr_auto]">
            <div className="relative h-24 w-full overflow-hidden rounded-xl sm:h-[90px] sm:w-[110px]">
              <Image src={p.images[0]} alt={p.title} fill sizes="110px" className="object-cover" />
            </div>
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-sm text-muted">{p.city} · {eur(p.rent)} / month · Inspection {eur(p.fee)} · To secure {eur(p.securing)}</p>
              <p className="mt-2"><span className="rounded-full bg-[#FFF0EF] px-3 py-1 text-xs font-extrabold text-velvet">{status}</span></p>
              {state.paid && !state.slot && (
                <div className="mt-3">
                  <p className="text-sm font-bold">Pick a viewing slot:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Thu 10:00', 'Fri 14:30', 'Sat 11:00'].map((s) => (
                      <button key={s} onClick={() => pickSlot(slug, s)} className="btn-press rounded-full border border-line bg-white px-3 py-2 text-sm font-bold">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {state.slot && <p className="mt-2 text-sm font-bold text-velvet">Viewing: {state.slot}. We will confirm by email in the real build.</p>}
            </div>
            <div>
              {!state.paid && <Link href={`/checkout/${slug}`} className="btn-press inline-block rounded-full bg-strawberry px-4 py-2 text-sm font-bold text-white">Pay inspection fee {eur(p.fee)}</Link>}
              {state.paid && <p className="text-sm font-extrabold text-green-700">Fee paid</p>}
              <div className="mt-2"><Link href="/contact" className="btn-press inline-block rounded-full border border-line px-4 py-2 text-sm font-bold text-velvet">Message agency</Link></div>
            </div>
          </article>
        );
      })}
      <div className="mt-6 rounded-2xl border border-line bg-white p-4">
        <p className="font-bold">Your next step, in order</p>
        <p className="mt-1 text-sm text-muted">1. Pay inspection fee, then 2. Pick a viewing slot, then 3. View the home, then 4. Decide, then pay the securing amount if you want it.</p>
      </div>
    </div>
  );
}
