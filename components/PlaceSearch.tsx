'use client';

import { useMemo, useState } from 'react';

/*
 * PlaceSearch: a search input with a small dropdown that sits right
 * under the input, inside the filters card. It is not a popup or a
 * modal: no overlay, no backdrop, no full screen layer. Tapping a
 * place in the dropdown fills the input with that place and filters
 * the homes below. The dropdown closes on selection.
 */
export default function PlaceSearch({
  value,
  onChange,
  places,
}: {
  value: string;
  onChange: (value: string) => void;
  places: string[];
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => p.toLowerCase().includes(q));
  }, [value, places]);

  return (
    <div className="relative">
      <label className="block text-xs font-extrabold uppercase tracking-wide text-muted">
        Search
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Place or home name"
          className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink outline-none"
        />
      </label>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-xl border border-line bg-white shadow-[0_12px_30px_rgba(94,18,32,0.18)]">
          {suggestions.map((place) => (
            <button
              key={place}
              type="button"
              onMouseDown={() => {
                onChange(place);
                setOpen(false);
              }}
              className="btn-press block w-full px-3 py-2.5 text-left text-sm font-bold text-ink hover:bg-[#FFF5F3]"
            >
              {place}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
