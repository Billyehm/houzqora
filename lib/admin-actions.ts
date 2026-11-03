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
    amenities: p.amenities, images: p.images, available: p.available ?? true,
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

export async function uploadPropertyImageAdmin(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: 'Not signed in as admin.' };
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Choose an image to upload.' };
  if (!file.type.startsWith('image/')) return { ok: false, error: 'Only image files can be uploaded.' };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'Image must be 5MB or smaller.' };
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleanName}`;
    const supabase = getAdminSupabase();
    const { error } = await supabase.storage.from('property-images').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not upload this image.' };
  }
}

export type AdminMessage = { id: string; name: string; email: string; message: string; created_at: string };

export async function fetchMessagesAdmin(): Promise<{ ok: boolean; messages: AdminMessage[]; error?: string }> {
  if (!(await isAdmin())) return { ok: false, messages: [], error: 'Not signed in as admin.' };
  try {
    const { data, error } = await getAdminSupabase().from('messages').select('id, name, email, message, created_at').order('created_at', { ascending: false });
    if (error) throw error;
    return { ok: true, messages: (data || []) as AdminMessage[] };
  } catch (e) {
    return { ok: false, messages: [], error: e instanceof Error ? e.message : 'Could not load messages.' };
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
