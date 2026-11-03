import { supabase } from './supabase';
import { properties as seedProperties, getProperty as getSeedProperty, type Property } from './properties';

export type AppUser = { id: string; name: string; email: string };
export type BookingState = { paid: boolean; slot: string };

// --- Properties: Supabase first, seed list only if the table is not
// there yet or returns nothing, so the public pages never go empty. ---

type PropertyRow = {
  slug: string; title: string; city: string; neighbourhood: string; type: string;
  bedrooms: number; bathrooms: number; toilets: number; size_m2: number;
  rent: number; fee: number; securing: number; furnished: string; parking: string;
  description: string; amenities: string[]; images: string[];
};

function toProperty(row: PropertyRow): Property {
  return {
    slug: row.slug, title: row.title, city: row.city, neighbourhood: row.neighbourhood,
    type: row.type, bedrooms: row.bedrooms, bathrooms: row.bathrooms, toilets: row.toilets,
    sizeM2: row.size_m2, rent: row.rent, fee: row.fee, securing: row.securing,
    furnished: row.furnished, parking: row.parking, description: row.description,
    amenities: row.amenities || [], images: row.images || [],
  };
}

export async function fetchProperties(): Promise<Property[]> {
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
    return toProperty(data as PropertyRow);
  } catch {
    return getSeedProperty(slug);
  }
}

// --- Auth ---

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  const meta = (u.user_metadata || {}) as Record<string, string>;
  return {
    id: u.id,
    name: meta.name || u.email?.split('@')[0] || 'Welcome',
    email: u.email || '',
  };
}

export async function ensureProfile(user: AppUser, phone = '') {
  try {
    await supabase.from('profiles').upsert({ id: user.id, name: user.name, email: user.email, phone });
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

export async function sendMessage(name: string, email: string, message: string) {
  const { error } = await supabase.from('messages').insert({ name, email, message });
  if (error) throw error;
}
