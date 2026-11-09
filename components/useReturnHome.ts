'use client';

import { useEffect, useRef } from 'react';
import type { Property } from '@/lib/properties';

const KEY = 'houzqora_return_home';
const MAX_AGE_MS = 10 * 60 * 1000;

// Remember the home a visitor just opened, so coming back can
// glide to that exact home instead of the top or the footer.
export function saveReturnHome(slug: string) {
  try {
    window.sessionStorage.setItem(KEY, `${slug}|${Date.now()}`);
  } catch {
    // Storage off: back just returns to the page.
  }
}

// After coming back from a home, glide to the home that was
// tapped. Runs once per mount, only if the home is on the page
// being shown. A stale mark (older than 10 minutes) is dropped.
export function useReturnHome(homes: Property[]) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || homes.length === 0) return;
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(KEY);
    } catch {
      raw = null;
    }
    if (!raw) return;
    const [slug, at] = raw.split('|');
    const age = Date.now() - Number(at || 0);
    if (!slug || Number.isNaN(age) || age > MAX_AGE_MS) {
      try {
        window.sessionStorage.removeItem(KEY);
      } catch {
        // Ignore.
      }
      return;
    }
    if (!homes.some((p) => p.slug === slug)) return;
    done.current = true;
    try {
      window.sessionStorage.removeItem(KEY);
    } catch {
      // Ignore.
    }
    // Let the layout settle, then glide to the home.
    const t = window.setTimeout(() => {
      document.getElementById(`home-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => window.clearTimeout(t);
  }, [homes]);
}
