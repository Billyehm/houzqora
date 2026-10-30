'use client';

import { useMemo, useState } from 'react';
import PropertyCard from './PropertyCard';
import type { Property } from '@/lib/properties';

export default function FilterGrid({ properties }: { properties: Property[] }) {
  const [city, setCity] = useState('All');
  const [beds, setBeds] = useState('All');
  const [sort, setSort] = useState('newest');

  const filtered = useMemo(() => {
    let list = properties.filter((p) => city === 'All' || p.city === city);
    if (beds !== 'All') list = list.filter((p) => String(p.bedrooms) === beds);
    if (sort === 'low') list = [...list].sort((a, b) => a.rent - b.rent);
    if (sort === 'high') list = [...list].sort((a, b) => b.rent - a.rent);
    return list;
  }, [properties, city, beds, sort]);

  return (
    <div>
      <div className="grid gap-2 rounded-2xl border border-line bg-white p-3 shadow-[0_8px_24px_rgba(94,18,32,0.08)] sm:grid-cols-4">
        <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
          City
          <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full border-0 bg-transparent text-sm font-bold text-ink outline-none">
            <option>All</option><option>Amsterdam</option><option>Rotterdam</option><option>Utrecht</option><option>The Hague</option>
          </select>
        </label>
        <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
          Bedrooms
          <select value={beds} onChange={(e) => setBeds(e.target.value)} className="mt-1 block w-full border-0 bg-transparent text-sm font-bold text-ink outline-none">
            <option>All</option><option value="1">1 bedroom</option><option value="2">2 bedrooms</option><option value="3">3 bedrooms</option>
          </select>
        </label>
        <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 block w-full border-0 bg-transparent text-sm font-bold text-ink outline-none">
            <option value="newest">Newest first</option><option value="low">Lowest rent</option><option value="high">Highest rent</option>
          </select>
        </label>
        <button onClick={() => { setCity('All'); setBeds('All'); setSort('newest'); }} className="btn-press self-end rounded-full border border-line px-4 py-2 text-sm font-bold text-velvet">Clear filters</button>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">No homes match that filter yet. Try clearing the filters.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <PropertyCard key={p.slug} p={p} index={i % 3} />)}
        </div>
      )}
    </div>
  );
}
