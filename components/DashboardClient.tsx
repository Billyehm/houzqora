'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import BottomNav from './BottomNav';
import { eur, properties } from '@/lib/properties';
import { getDemoUser, getSavedSlugs, toggleSavedSlug, type DemoUser } from '@/lib/demo';

const cities = ['All', 'Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'];
const bedroomOptions = ['Any', '1', '2', '3+'];
const minOptions = ['', '1600', '1800', '2000', '2200'];
const maxOptions = ['', '1800', '2000', '2200', '2500'];

export default function DashboardClient() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [beds, setBeds] = useState('Any');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setUser(getDemoUser());
    setSaved(getSavedSlugs());
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (q && ![p.title, p.city, p.neighbourhood].join(' ').toLowerCase().includes(q)) return false;
      if (city !== 'All' && p.city !== city) return false;
      if (beds === '1' && p.bedrooms !== 1) return false;
      if (beds === '2' && p.bedrooms !== 2) return false;
      if (beds === '3+' && p.bedrooms < 3) return false;
      if (minRent && p.rent < Number(minRent)) return false;
      if (maxRent && p.rent > Number(maxRent)) return false;
      return true;
    });
  }, [search, city, beds, minRent, maxRent]);

  if (!loaded) return <p className="mt-6">Loading dashboard...</p>;

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

  const firstName = user.name.split(' ')[0];
  const clearAll = () => {
    setSearch('');
    setCity('All');
    setBeds('Any');
    setMinRent('');
    setMaxRent('');
  };

  return (
    <div className="pb-28">
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold text-velvet">Dashboard</h1>
        <span className="rounded-full bg-[#FFF0EF] px-3 py-1 text-xs font-extrabold text-velvet">Demo</span>
      </div>
      <p className="mt-2 text-xl font-bold">Welcome, {firstName}</p>

      <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(94,18,32,0.08)]">
        <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Place or home name"
            className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
            Location
            <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none">
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
            Bedrooms
            <select value={beds} onChange={(e) => setBeds(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none">
              {bedroomOptions.map((b) => (
                <option key={b} value={b}>{b === 'Any' ? 'Any' : `${b} bedrooms`}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
            Min rent
            <select value={minRent} onChange={(e) => setMinRent(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none">
              {minOptions.map((v) => (
                <option key={v || 'any'} value={v}>{v ? eur(Number(v)) : 'Any'}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
            Max rent
            <select value={maxRent} onChange={(e) => setMaxRent(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none">
              {maxOptions.map((v) => (
                <option key={v || 'any'} value={v}>{v ? eur(Number(v)) : 'Any'}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={clearAll} className="btn-press mt-4 rounded-full border border-line px-4 py-2 text-sm font-bold text-velvet">Clear filters</button>
      </div>

      <p className="mt-6 text-sm font-extrabold text-velvet">{filtered.length} homes</p>
      {filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-extrabold text-velvet">No homes found</h2>
          <button onClick={clearAll} className="btn-press mt-4 rounded-full bg-strawberry px-5 py-3 font-bold text-white">Clear filters</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <PropertyCard
              key={p.slug}
              p={p}
              index={i % 3}
              showSave
              saved={saved.includes(p.slug)}
              onToggleSave={() => {
                const nowSaved = toggleSavedSlug(p.slug);
                setSaved((s) => (nowSaved ? [...s, p.slug] : s.filter((x) => x !== p.slug)));
              }}
            />
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
