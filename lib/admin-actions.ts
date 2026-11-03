'use server';

import { isAdmin } from './admin-auth';
import { getAdminSupabase } from './admin-supabase';
import type { Property } from './properties';

type Result = { ok: boolean; error?: string };

function toRow(p: Property) {
  return {
    slug: p.slug, title: p.title, city: p.city, neighbourhood: p.neighbourhood,
    type: p.type, bedrooms: p.bedrooms, bathrooms: p.bathrooms, toilets: p.toilets,
    size_m2: p.sizeM2, rent: p.rent, fee: p.fee, securing: p.securing,
    furnished: p.furnished, parking: p.parking, description: p.description,
    amenities: p.amenities, images: p.images, available: true,
  };
}

export async function createPropertyAdmin(p: Property): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'Not signed in as admin.' };
  try {
    const { error } = await getAdminSupabase().from('properties').insert(toRow(p));
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save this house.' };
  }
}

export async function updatePropertyAdmin(slug: string, p: Property): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'Not signed in as admin.' };
  try {
    const { error } = await getAdminSupabase().from('properties').update(toRow(p)).eq('slug', slug);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save this house.' };
  }
}

export async function deletePropertyAdmin(slug: string): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'Not signed in as admin.' };
  try {
    const { error } = await getAdminSupabase().from('properties').delete().eq('slug', slug);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not delete this house.' };
  }
}
