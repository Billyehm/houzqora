import { supabase } from './supabase';
import { properties as seedProperties, getProperty as getSeedProperty, type Property } from './properties';

export type AppUser = { id: string; name: string; email: string; phone?: string };
export type BookingState = { paid: boolean; slot: string };

// --- Properties: the Supabase table is the only source of homes.
// If it fails or returns nothing, the app shows an empty state,
// never a stale hard coded list. ---

type PropertyRow = {
  slug: string; title: string; city: string; neighbourhood: string; type: string;
  bedrooms: number; bathrooms: number; toilets: number; size_m2: number;
  rent: number; fee: number; securing: number; furnished: string; parking: string;
  description: string; amenities: string[]; images: string[]; available?: boolean;
};

function toProperty(row: PropertyRow): Property {
  return {
    slug: row.slug, title: row.title, city: row.city, neighbourhood: row.neighbourhood,
    type: row.type, bedrooms: row.bedrooms, bathrooms: row.bathrooms, toilets: row.toilets,
    sizeM2: row.size_m2, rent: row.rent, fee: row.fee, securing: row.securing,
    furnished: row.furnished, parking: row.parking, description: row.description,
    amenities: row.amenities || [], images: row.images || [],
    available: row.available ?? true,
  };
}

// Public listings: only homes marked available in the admin panel.
export async function fetchProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase.from('properties').select('*').eq('available', true).order('created_at');
    if (error || !data || data.length === 0) return seedProperties;
    return data.map(toProperty);
  } catch {
    return seedProperties;
  }
}

// Admin, bookings and saved homes: every home, including unavailable
// ones, so an existing booking or saved home never vanishes and the
// admin can turn a home available again.
export async function fetchAllProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase.from('properties').select('*').order('created_at');
    if (error || !data || data.length === 0) return seedProperties;
    return data.map(toProperty);
  } catch {
    return seedProperties;
  }
}

export async function fetchProperty(slug: string): Promise<Property | undefined> {
  try {
    const { data, error } = await supabase.from('properties').select('*').eq('slug', slug).single();
    if (error || !data) return getSeedProperty(slug);
    const property = toProperty(data as PropertyRow);
    if (!property.available) return undefined;
    return property;
  } catch {
    return getSeedProperty(slug);
  }
}

// --- Auth ---

// In-flight dedupe only, not a cache. The dashboard mounts the
// header, the discount banner, the bottom nav, the dashboard
// itself, and one InspectionFee per home at the same time, and
// every one of them called getCurrentUser, so every one of them
// did its own auth check plus its own profiles query. Sharing the
// one call that is already running collapses those into a single
// auth check and a single profiles query. Once it settles the
// slot clears, so a later call, after login or logout, fetches
// fresh instead of returning a stale user.
let currentUserInflight: Promise<AppUser | null> | null = null;

export function getCurrentUser(): Promise<AppUser | null> {
  if (currentUserInflight) return currentUserInflight;
  currentUserInflight = (async (): Promise<AppUser | null> => {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return null;
    const meta = (u.user_metadata || {}) as Record<string, string>;
    const fallback = {
      id: u.id,
      name: meta.name || u.email?.split('@')[0] || 'Welcome',
      email: u.email || '',
      phone: meta.phone || '',
    };
    // The profiles table is the source of truth for name and email
    // once a profile row exists, instead of only the login account
    // metadata. Fall back to metadata if there is no row yet, or if
    // the profiles query fails, so login never breaks on it.
    try {
      const { data: profile, error } = await supabase.from('profiles').select('name, email, phone').eq('id', u.id).single();
      if (error || !profile) return fallback;
      return {
        id: u.id,
        name: profile.name?.trim() ? profile.name : fallback.name,
        email: profile.email?.trim() ? profile.email : fallback.email,
        phone: profile.phone?.trim() ? profile.phone : fallback.phone,
      };
    } catch {
      return fallback;
    }
  })();
  currentUserInflight.then(
    () => { currentUserInflight = null; },
    () => { currentUserInflight = null; },
  );
  return currentUserInflight;
}

export async function ensureProfile(user: AppUser, phone = '') {
  try {
    // Never let an empty phone wipe a saved one. Login shows no
    // phone field, so its phone argument is empty, and that used
    // to overwrite the signup phone on every login. Now an empty
    // argument keeps the phone already in the profiles table, and
    // if there is no row yet it is simply left out, so the column
    // default applies instead of an overwrite.
    let resolvedPhone = phone.trim();
    if (!resolvedPhone) {
      const { data: existing } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
      if (existing?.phone) resolvedPhone = existing.phone;
    }
    await supabase.from('profiles').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      ...(resolvedPhone ? { phone: resolvedPhone } : {}),
    });
  } catch {
    // Profiles table not created yet. Auth still works, the profile
    // will be created on the next sign in once the schema is run.
  }
}

// --- Saved homes and bookings: Supabase first, browser storage only
// as a fallback while the schema has not been run yet. ---

const SAVED_KEY = 'houzqora_saved';
const BOOKINGS_KEY = 'houzqora_bookings';

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function fetchSavedSlugs(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('saved_homes').select('property_slug').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((r) => r.property_slug);
  } catch {
    return readLocal<string[]>(SAVED_KEY, []);
  }
}

export async function toggleSavedSlug(userId: string, slug: string): Promise<boolean> {
  try {
    const saved = await fetchSavedSlugs(userId);
    if (saved.includes(slug)) {
      const { error } = await supabase.from('saved_homes').delete().eq('user_id', userId).eq('property_slug', slug);
      if (error) throw error;
      return false;
    }
    const { error } = await supabase.from('saved_homes').insert({ user_id: userId, property_slug: slug });
    if (error) throw error;
    return true;
  } catch {
    const saved = readLocal<string[]>(SAVED_KEY, []);
    const next = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
    writeLocal(SAVED_KEY, next);
    return next.includes(slug);
  }
}

export async function fetchBookings(userId: string): Promise<Record<string, BookingState>> {
  try {
    const { data, error } = await supabase.from('bookings').select('property_slug, fee_paid, viewing_slot').eq('user_id', userId);
    if (error) throw error;
    const out: Record<string, BookingState> = {};
    (data || []).forEach((r) => {
      out[r.property_slug] = { paid: r.fee_paid, slot: r.viewing_slot || '' };
    });
    return out;
  } catch {
    return readLocal<Record<string, BookingState>>(BOOKINGS_KEY, {});
  }
}

export async function upsertBooking(userId: string, slug: string, state: BookingState) {
  try {
    const { error } = await supabase.from('bookings').upsert(
      { user_id: userId, property_slug: slug, fee_paid: state.paid, viewing_slot: state.slot, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,property_slug' },
    );
    if (error) throw error;
  } catch {
    const homes = readLocal<Record<string, BookingState>>(BOOKINGS_KEY, {});
    homes[slug] = state;
    writeLocal(BOOKINGS_KEY, homes);
  }
}

// Pending slug is only a redirect helper: the home a visitor was
// looking at before signing up, so they land back on it afterwards.
const PENDING_KEY = 'houzqora_pending';

export function getPendingSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PENDING_KEY);
}

export function setPendingSlug(slug: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_KEY, slug);
}

export function clearPendingSlug() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_KEY);
}

// Pending path is the same idea for a whole page, not just a home:
// the page a visitor was trying to reach before logging in, so
// they land back on it afterwards. Used for the agents page, so a
// visitor who taps Contact agent while logged out goes through
// login first and then lands back on the agents page.
const PENDING_PATH_KEY = 'houzqora_pending_path';

export function getPendingPath(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.localStorage.getItem(PENDING_PATH_KEY);
  return path && path.startsWith('/') ? path : null;
}

export function setPendingPath(path: string) {
  if (typeof window === 'undefined') return;
  if (!path.startsWith('/')) return;
  window.localStorage.setItem(PENDING_PATH_KEY, path);
}

export function clearPendingPath() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_PATH_KEY);
}
