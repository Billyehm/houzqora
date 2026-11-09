'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PropertyCard from './PropertyCard';
import PlaceSearch from './PlaceSearch';
import Pagination from './Pagination';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/queries';
import type { Property } from '@/lib/properties';

export default function FilterGrid({ properties }: { properties: Property[] }) {
  const [city, setCity] = useState('All');
  const [beds, setBeds] = useState('All');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The page lives in the address (?page=6). The back button then
  // returns to the exact page instead of the list starting over.
  const rawPage = Number(searchParams.get('page') ?? '1');
  const pageParam = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize = 4;

  const goToPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (n <= 1) params.delete('page');
    else params.set('page', String(n));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Landing page gate: logged-out taps on a home open login.
  // Starts gated, then opens up to detail once a session is found,
  // and flips back on logout.
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    getCurrentUser().then((u) => setUserId(u ? u.id : null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const places = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    properties.forEach((p) => {
      [p.city, p.neighbourhood].forEach((place) => {
        if (!seen.has(place)) {
          seen.add(place);
          list.push(place);
        }
      });
    });
    return list;
  }, [properties]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = properties.filter((p) => city === 'All' || p.city === city);
    if (beds !== 'All') list = list.filter((p) => String(p.bedrooms) === beds);
    if (q) list = list.filter((p) => [p.title, p.city, p.neighbourhood].join(' ').toLowerCase().includes(q));
    if (sort === 'low') list = [...list].sort((a, b) => a.rent - b.rent);
    if (sort === 'high') list = [...list].sort((a, b) => b.rent - a.rent);
    return list;
  }, [properties, city, beds, sort, search]);

  // A filter change starts the list over at page 1. The first run
  // is skipped so a shared ?page= link still opens on that page.
  const firstFilters = useRef(true);
  useEffect(() => {
    if (firstFilters.current) {
      firstFilters.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (!params.has('page')) return;
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // Only the filters reset the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, beds, sort, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(pageParam, totalPages);
  const pageHomes = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearAll = () => {
    setCity('All');
    setBeds('All');
    setSort('newest');
    setSearch('');
  };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-3 shadow-[0_8px_24px_rgba(94,18,32,0.08)]">
        <button type="button" onClick={() => setFiltersOpen((o) => !o)} className="btn-press flex w-full items-center justify-between px-1 py-1 text-left" aria-expanded={filtersOpen}>
          <span className="text-sm font-extrabold text-velvet">Filters</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={filtersOpen ? 'rotate-180 text-velvet' : 'text-velvet'}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {filtersOpen && (
          <>
            <div className="mt-3">
              <PlaceSearch value={search} onChange={setSearch} places={places} />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
                City
                <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full border-0 bg-transparent text-sm font-bold text-ink outline-none">
                  <option>All</option><option>Alkmaar</option><option>Amersfoort</option><option>Amsterdam</option><option>Arnhem</option><option>Breda</option><option>Delft</option><option>Dordrecht</option><option>Eindhoven</option><option>Enschede</option><option>Gouda</option><option>Groningen</option><option>Haarlem</option><option>Leiden</option><option>Maastricht</option><option>Nijmegen</option><option>Rotterdam</option><option>The Hague</option><option>Tilburg</option><option>Utrecht</option><option>Zwolle</option>
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
              <button onClick={clearAll} className="btn-press self-end rounded-full border border-line px-4 py-2 text-sm font-bold text-velvet">Clear filters</button>
            </div>
          </>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">No homes match that filter yet. Try clearing the filters.</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageHomes.map((p, i) => <PropertyCard key={p.slug} p={p} index={((page - 1) * pageSize + i) % 3} gateToLogin={!userId} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
        </>
      )}
    </div>
  );
}
