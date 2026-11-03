'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { fetchAllProperties, fetchSavedSlugs, getCurrentUser, toggleSavedSlug, type AppUser } from '@/lib/queries';
import type { Property } from '@/lib/properties';

export default function SavedClient() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setAllProperties(await fetchAllProperties());
      if (u) setSaved(await fetchSavedSlugs(u.id));
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return <p className="mt-6">Loading saved homes...</p>;

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

  const homes = saved.map((slug) => allProperties.find((p) => p.slug === slug)).filter((p) => p !== undefined);

  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Saved</h1>
      {homes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-extrabold text-velvet">No saved homes</h2>
          <Link href="/dashboard" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Dashboard</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homes.map((p, i) => (
            <PropertyCard
              key={p.slug}
              p={p}
              index={i % 3}
              showSave
              saved
              onToggleSave={async () => {
                if (!user) return;
                await toggleSavedSlug(user.id, p.slug);
                setSaved((s) => s.filter((x) => x !== p.slug));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
