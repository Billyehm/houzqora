'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout } from '@/lib/admin-auth';
import { createPropertyAdmin, deletePropertyAdmin, fetchMessagesAdmin, updatePropertyAdmin, uploadPropertyImageAdmin, type AdminMessage } from '@/lib/admin-actions';
import { fetchAllProperties } from '@/lib/queries';
import Spinner from '@/components/Spinner';
import type { Property } from '@/lib/properties';

const emptyForm: Property = {
  slug: '', title: '', city: '', neighbourhood: '', type: 'Apartment',
  bedrooms: 1, bathrooms: 1, toilets: 1, sizeM2: 50,
  rent: 0, fee: 0, securing: 0,
  furnished: '', parking: '', description: '', amenities: [], images: [],
  available: true,
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminPanel({ initialProperties }: { initialProperties: Property[] }) {
  const router = useRouter();
  const [list, setList] = useState<Property[]>(initialProperties);
  const [form, setForm] = useState<Property>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMessagesAdmin().then((result) => {
      if (!cancelled && result.ok) setMessages(result.messages);
    });
    return () => { cancelled = true; };
  }, []);

  const set = (key: keyof Property, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const startAdd = () => {
    setForm(emptyForm);
    setAmenitiesText('');
    setEditing(null);
    setError('');
    setNotice('');
  };

  const startEdit = (p: Property) => {
    setForm(p);
    setAmenitiesText(p.amenities.join(', '));
    setEditing(p.slug);
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadPropertyImageAdmin(formData);
        if (!result.ok || !result.url) throw new Error(result.error || 'Could not upload this image.');
        uploaded.push(result.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload this image.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((x) => x !== url) }));
  };

  const refresh = async () => {
    setList(await fetchAllProperties());
  };

  const save = async () => {
    setError('');
    setNotice('');
    const slug = editing || slugify(form.title);
    if (!slug) { setError('Give the house a title, so a slug can be made from it.'); return; }
    if (!form.title.trim() || !form.city.trim()) { setError('Title and city are required.'); return; }
    const property: Property = {
      ...form,
      slug,
      title: form.title.trim(),
      city: form.city.trim(),
      amenities: amenitiesText.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images,
    };
    setBusy(true);
    try {
      const result = editing
        ? await updatePropertyAdmin(editing, property)
        : await createPropertyAdmin(property);
      if (!result.ok) throw new Error(result.error || 'Could not save this house.');
      await refresh();
      setNotice(editing ? 'House updated.' : 'House added.');
      startAdd();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this house. If SUPABASE_SERVICE_ROLE_KEY is not set in .env.local, or the service role grants have not been run, the write will be rejected.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (slug: string) => {
    if (!window.confirm('Delete this house? This cannot be undone.')) return;
    setError('');
    setDeleting(slug);
    try {
      const result = await deletePropertyAdmin(slug);
      if (!result.ok) throw new Error(result.error || 'Could not delete this house.');
      await refresh();
      setNotice('House deleted.');
      if (editing === slug) startAdd();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete this house.');
    } finally {
      setDeleting(null);
    }
  };

  const logOut = async () => {
    await adminLogout();
    router.refresh();
  };

  const input = "mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none";
  const label = "block text-xs font-extrabold text-velvet";

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-velvet">Admin panel</h1>
        <button onClick={logOut} className="btn-press rounded-full bg-velvet px-5 py-2.5 text-sm font-bold text-white">Log out</button>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-velvet">{editing ? 'Edit house' : 'Add a house'}</h2>
        {editing && <p className="mt-1 text-sm text-muted">Slug cannot be changed after creation, because saved homes and bookings point to it.</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={label}>Title<input value={form.title} onChange={(e) => set('title', e.target.value)} className={input} /></label>
          <label className={label}>Slug (made from the title)<input value={editing ? form.slug : slugify(form.title)} disabled className={input} /></label>
          <label className={label}>City<input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} /></label>
          <label className={label}>Neighbourhood<input value={form.neighbourhood} onChange={(e) => set('neighbourhood', e.target.value)} className={input} /></label>
          <label className={label}>Type<input value={form.type} onChange={(e) => set('type', e.target.value)} className={input} /></label>
          <label className={label}>Furnishing<input value={form.furnished} onChange={(e) => set('furnished', e.target.value)} className={input} /></label>
          <label className={label}>Parking<input value={form.parking} onChange={(e) => set('parking', e.target.value)} className={input} /></label>
          <label className={label}>Available<input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="mt-2 block h-5 w-5" /></label>
          <label className={label}>Bedrooms<input type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', Number(e.target.value))} className={input} /></label>
          <label className={label}>Bathrooms<input type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', Number(e.target.value))} className={input} /></label>
          <label className={label}>Toilets<input type="number" value={form.toilets} onChange={(e) => set('toilets', Number(e.target.value))} className={input} /></label>
          <label className={label}>Size (m2)<input type="number" value={form.sizeM2} onChange={(e) => set('sizeM2', Number(e.target.value))} className={input} /></label>
          <label className={label}>Rent / month (€)<input type="number" value={form.rent} onChange={(e) => set('rent', Number(e.target.value))} className={input} /></label>
          <label className={label}>Inspection fee (€)<input type="number" value={form.fee} onChange={(e) => set('fee', Number(e.target.value))} className={input} /></label>
          <label className={label}>Amount to secure (€)<input type="number" value={form.securing} onChange={(e) => set('securing', Number(e.target.value))} className={input} /></label>
        </div>
        <label className={`${label} mt-3`}>Description<textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={input} /></label>
        <label className={`${label} mt-3`}>Amenities, separated by commas<textarea value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} rows={2} className={input} /></label>
        <div className="mt-3">
          <p className={label}>Images</p>
          <input type="file" accept="image/*" multiple onChange={(e) => { void handleUpload(e.target.files); e.target.value = ''; }} className={`${input} mt-1`} />
          {uploading && <p className="mt-2 flex items-center gap-2 text-sm font-bold text-velvet"><Spinner />Uploading...</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-24 w-32 rounded-xl border border-line object-cover" />
                <button type="button" onClick={() => removeImage(url)} className="btn-press absolute -right-2 -top-2 rounded-full bg-strawberry px-2 py-0.5 text-xs font-bold text-white">Remove</button>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
        {notice && <p className="mt-3 text-sm font-bold text-green-700">{notice}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={save} disabled={busy} className="btn-press flex items-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">{busy && <Spinner />}{editing ? 'Save changes' : 'Add house'}</button>
          {editing && <button onClick={startAdd} className="btn-press rounded-full border border-line px-5 py-3 font-bold text-velvet">Cancel edit</button>}
        </div>
      </div>

      <h2 className="mt-8 text-xl font-extrabold text-velvet">Houses ({list.length})</h2>
      <div className="mt-3 space-y-2">
        {list.map((p) => (
          <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
            <span><span className="font-bold">{p.title}</span> <span className="text-muted">· {p.city} · €{p.rent} / month · Fee €{p.fee} · Secure €{p.securing}</span>{!p.available && <span className="ml-2 rounded-full bg-strawberry px-2 py-0.5 text-xs font-extrabold text-white">Unavailable</span>}</span>
            <span className="flex gap-2">
              <button onClick={() => startEdit(p)} className="btn-press rounded-full border border-line px-4 py-2 font-bold text-velvet">Edit</button>
              <button onClick={() => remove(p.slug)} disabled={deleting === p.slug} className="btn-press flex items-center gap-2 rounded-full bg-strawberry px-4 py-2 font-bold text-white disabled:opacity-60">{deleting === p.slug && <Spinner className="h-3.5 w-3.5" />}Delete</button>
            </span>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-extrabold text-velvet">Messages ({messages.length})</h2>
      <div className="mt-3 space-y-2">
        {messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
            <p><span className="font-bold">{m.name}</span> <span className="text-muted">· {m.email} · {new Date(m.created_at).toLocaleDateString('en-GB')}</span></p>
            <p className="mt-1 break-words">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
