'use client';

import { useMemo, useState } from 'react';

// Big countries whose currency is a dollar or the euro. The plus
// sign is constant: the button always shows +code, the user never
// types it, and the phone box beside it holds only the local number.
export type CountryCode = { name: string; code: string };

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Netherlands', code: '31' },
  { name: 'Germany', code: '49' },
  { name: 'France', code: '33' },
  { name: 'Spain', code: '34' },
  { name: 'Italy', code: '39' },
  { name: 'Ireland', code: '353' },
  { name: 'Belgium', code: '32' },
  { name: 'Luxembourg', code: '352' },
  { name: 'Austria', code: '43' },
  { name: 'Portugal', code: '351' },
  { name: 'Finland', code: '358' },
  { name: 'Greece', code: '30' },
  { name: 'Slovakia', code: '421' },
  { name: 'Slovenia', code: '386' },
  { name: 'Estonia', code: '372' },
  { name: 'Latvia', code: '371' },
  { name: 'Lithuania', code: '370' },
  { name: 'Malta', code: '356' },
  { name: 'Cyprus', code: '357' },
  { name: 'United States', code: '1' },
  { name: 'Canada', code: '1' },
  { name: 'Australia', code: '61' },
  { name: 'New Zealand', code: '64' },
  { name: 'Singapore', code: '65' },
  { name: 'Hong Kong', code: '852' },
];

export default function CountryCodePicker({
  code,
  onChange,
  disabled,
}: {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    const digits = q.replace(/[^0-9]/g, '');
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || (digits && c.code.includes(digits))
    );
  }, [query]);

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="Country code"
        aria-expanded={open}
        className="btn-press flex h-full items-center gap-1 rounded-xl border border-line bg-cream px-3 py-2.5 text-sm font-bold text-velvet disabled:opacity-60"
      >
        +{code}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close country list" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default bg-black/20" />
          <span className="absolute left-0 top-full z-50 mt-2 block w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              autoFocus
              className="block w-full rounded-xl border border-line px-3 py-2 text-sm outline-none"
            />
            <span className="mt-2 block max-h-60 overflow-y-auto">
              {filtered.length === 0 && (
                <span className="block px-3 py-2 text-sm text-muted">No match</span>
              )}
              {filtered.map((c) => (
                <button
                  key={`${c.name}-${c.code}`}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setQuery(''); }}
                  className={`btn-press flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${c.code === code ? 'bg-cream font-bold text-velvet' : 'text-velvet'}`}
                >
                  <span>{c.name}</span>
                  <span className="font-bold">+{c.code}</span>
                </button>
              ))}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
