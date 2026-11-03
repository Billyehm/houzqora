'use client';

import { useMemo, useState } from 'react';

// Big countries whose currency is a dollar or the euro. The plus
// sign is constant: the button always shows +code, the user never
// types it, and the phone box beside it holds only the local number.
export type CountryCode = { name: string; code: string; flag: string };

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Netherlands', code: '31', flag: '🇳🇱' },
  { name: 'Germany', code: '49', flag: '🇩🇪' },
  { name: 'France', code: '33', flag: '🇫🇷' },
  { name: 'Spain', code: '34', flag: '🇪🇸' },
  { name: 'Italy', code: '39', flag: '🇮🇹' },
  { name: 'Ireland', code: '353', flag: '🇮🇪' },
  { name: 'Belgium', code: '32', flag: '🇧🇪' },
  { name: 'Luxembourg', code: '352', flag: '🇱🇺' },
  { name: 'Austria', code: '43', flag: '🇦🇹' },
  { name: 'Portugal', code: '351', flag: '🇵🇹' },
  { name: 'Finland', code: '358', flag: '🇫🇮' },
  { name: 'Greece', code: '30', flag: '🇬🇷' },
  { name: 'Slovakia', code: '421', flag: '🇸🇰' },
  { name: 'Slovenia', code: '386', flag: '🇸🇮' },
  { name: 'Estonia', code: '372', flag: '🇪🇪' },
  { name: 'Latvia', code: '371', flag: '🇱🇻' },
  { name: 'Lithuania', code: '370', flag: '🇱🇹' },
  { name: 'Malta', code: '356', flag: '🇲🇹' },
  { name: 'Cyprus', code: '357', flag: '🇨🇾' },
  { name: 'United States', code: '1', flag: '🇺🇸' },
  { name: 'Canada', code: '1', flag: '🇨🇦' },
  { name: 'Australia', code: '61', flag: '🇦🇺' },
  { name: 'New Zealand', code: '64', flag: '🇳🇿' },
  { name: 'Singapore', code: '65', flag: '🇸🇬' },
  { name: 'Hong Kong', code: '852', flag: '🇭🇰' },
];

export default function CountryCodePicker({
  country,
  onChange,
  disabled,
}: {
  country: CountryCode;
  onChange: (country: CountryCode) => void;
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
        <span aria-hidden="true">{country.flag}</span>
        +{country.code}
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
                  onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                  className={`btn-press flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${c.name === country.name && c.code === country.code ? 'bg-cream font-bold text-velvet' : 'text-velvet'}`}
                >
                  <span><span aria-hidden="true">{c.flag}</span> {c.name}</span>
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
