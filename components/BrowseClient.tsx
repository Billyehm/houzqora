'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { eur, properties } from '@/lib/properties';
import { addMyHome, getDemoUser, getMyHomes, type DemoUser } from '@/lib/demo';

export default function BrowseClient() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getDemoUser());
    const homes = getMyHomes();
    setMine(Object.fromEntries(Object.keys(homes).map((k) => [k, true])));
    setLoaded(true);
  }, []);

  if (!loaded) return <p className="mt-6">Loading your browse page...</p>;

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">Please log in first</h2>
        <p className="mt-2 text-muted">Welcome browse homes is for signed in visitors. Log in, or sign up, and you will come straight back here.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="btn-press rounded-full bg-velvet px-5 py-3 font-bold text-white">Log in</Link>
          <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-3 font-bold text-white">Sign up</Link>
        </div>
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];

  return (
    <div>
      <p className="mt-4 rounded-xl bg-cream p-3 text-sm text-muted">Demo account only in this stage. No real account is created yet.</p>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Welcome, {firstName}. Browse homes.</h1>
      <p className="mt-2 text-muted">Pick a home you like. Add it to My homes, then enter My homes to pay, pick a viewing slot, and track next steps.</p>
      <Link href="/my-homes" className="btn-press mt-4 inline-block rounded-full bg-velvet px-5 py-3 font-bold text-white">Enter My homes</Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <article key={p.slug} className="card-lift overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative h-44 overflow-hidden">
              <Image src={p.images[0]} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="img-zoom object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xl font-extrabold text-velvet">{eur(p.rent)} <span className="text-sm font-semibold text-muted">/ month</span></p>
              <p className="mt-1 font-bold">{p.title}</p>
              <p className="mt-1 text-sm text-muted">{p.city} · {p.bedrooms} bed · {p.sizeM2} m2 · Inspection {eur(p.fee)}</p>
              <button
                onClick={() => { addMyHome(p.slug); setMine((m) => ({ ...m, [p.slug]: true })); }}
                className="btn-press mt-3 rounded-full bg-strawberry px-4 py-2 text-sm font-bold text-white"
              >
                {mine[p.slug] ? 'Added to My homes' : 'Add to My homes'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
