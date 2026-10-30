import { properties } from '@/lib/properties';

export default function AdminPage() {
  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Admin dashboard</h1>
      <p className="mt-2 rounded-xl bg-cream p-3 text-sm text-muted">
        Placeholder dashboard for this stage. Full admin CRUD, real payments, and email are later stages and are not faked here.
        Counts below come only from the seed list in code.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Total properties in seed</p><p className="text-2xl font-extrabold">{properties.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Available in seed</p><p className="text-2xl font-extrabold">{properties.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-muted">Real payments recorded</p><p className="text-2xl font-extrabold">0</p></div>
      </div>
      <h2 className="mt-6 text-xl font-extrabold text-velvet">Seed properties</h2>
      <div className="mt-3 space-y-2">
        {properties.map((p) => (
          <div key={p.slug} className="flex flex-wrap justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm">
            <span className="font-bold">{p.title}</span>
            <span className="text-muted">{p.city} · Rent €{p.rent} / month · Fee €{p.fee} · Secure €{p.securing}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">Next admin work: property create, edit, delete, image management, fee and securing amount editing, availability controls, payment table, and activity log, all behind real admin auth.</p>
    </div>
  );
}
