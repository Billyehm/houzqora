import { notFound } from 'next/navigation';
import Link from 'next/link';
import Gallery from '@/components/Gallery';
import BookActions from '@/components/BookActions';
import { eur, getProperty, properties } from '@/lib/properties';

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const p = getProperty(params.slug);
  if (!p) notFound();
  return (
    <div>
      <Link href="/properties" className="mt-4 inline-block text-sm font-bold text-velvet">Back to properties</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Gallery images={p.images} title={p.title} />
          <h1 className="mt-5 text-3xl font-extrabold text-velvet">{p.title}</h1>
          <p className="mt-1 text-muted">{p.neighbourhood}, {p.city}</p>
          <p className="mt-4 text-muted">{p.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Type</p><p className="font-bold">{p.type}</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Bedrooms</p><p className="font-bold">{p.bedrooms}</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Bathrooms</p><p className="font-bold">{p.bathrooms}</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Toilets</p><p className="font-bold">{p.toilets}</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Size</p><p className="font-bold">{p.sizeM2} m2</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Furnishing</p><p className="font-bold">{p.furnished}</p></div>
            <div className="rounded-xl border border-line bg-white p-3"><p className="text-muted">Parking</p><p className="font-bold">{p.parking}</p></div>
          </div>
          <h2 className="mt-6 text-xl font-extrabold text-velvet">Amenities</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {p.amenities.map((a) => <li key={a} className="rounded-full border border-line bg-white px-3 py-1 text-sm">{a}</li>)}
          </ul>
        </div>
        <aside className="h-fit rounded-2xl bg-velvet p-5 text-white">
          <p className="text-2xl font-extrabold">{eur(p.rent)} <span className="text-sm font-semibold text-white/70">/ month</span></p>
          <div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-sm text-ink">
            <p className="flex justify-between"><span>Monthly rent</span><b>{eur(p.rent)}</b></p>
            <p className="flex justify-between"><span>Inspection fee</span><b>{eur(p.fee)}</b></p>
            <p className="flex justify-between border-t border-line pt-2"><span>Remaining to secure</span><b>{eur(p.securing)}</b></p>
            <p className="text-xs text-muted">The securing amount is set per property. It is first month rent plus deposit in this seed set, not assumed from rent alone in the real admin.</p>
          </div>
          <p className="mt-4 rounded-xl border border-white/25 p-3 text-sm text-white/80">
            Inspection fee is non-refundable. It covers arranging and conducting your viewing. It does not reserve this home.
          </p>
          <div className="mt-4"><BookActions slug={p.slug} /></div>
          <p className="mt-3 text-xs text-white/70">If you are not signed in, booking will take you to signup first, then to Dashboard.</p>
        </aside>
      </div>
    </div>
  );
}
