import { fetchProperties } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export default async function AdminPage() {
  const properties = await fetchProperties();
  let bookingCount = 0;
  try {
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    bookingCount = count || 0;
  } catch {
    bookingCount = 0;
  }

  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Admin dashboard</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Total properties</p><p className="text-2xl font-extrabold">{properties.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Available</p><p className="text-2xl font-extrabold">{properties.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Inspection requests</p><p className="text-2xl font-extrabold">{bookingCount}</p></div>
      </div>
      <h2 className="mt-6 text-xl font-extrabold text-velvet">Properties</h2>
      <div className="mt-3 space-y-2">
        {properties.map((p) => (
          <div key={p.slug} className="flex flex-wrap justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm">
            <span className="font-bold">{p.title}</span>
            <span className="text-muted">{p.city} · Rent €{p.rent} / month · Fee €{p.fee} · Secure €{p.securing}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
