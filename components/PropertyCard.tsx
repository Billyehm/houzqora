import Image from 'next/image';
import Link from 'next/link';
import { eur, type Property } from '@/lib/properties';

export default function PropertyCard({
  p,
  index = 0,
  showSave = false,
  saved = false,
  onToggleSave,
}: {
  p: Property;
  index?: number;
  showSave?: boolean;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const rise = index === 0 ? 'rise' : index === 1 ? 'rise-2' : 'rise-3';
  return (
    <article className={`card-lift overflow-hidden rounded-2xl border border-line bg-white ${rise}`}>
      <Link href={`/properties/${p.slug}`}>
        <div className="relative h-44 overflow-hidden">
          <Image src={p.images[0]} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="img-zoom object-cover" />
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xl font-extrabold text-velvet">{eur(p.rent)} <span className="text-sm font-semibold text-muted">/ month</span></p>
        <Link href={`/properties/${p.slug}`} className="mt-1 block font-bold hover:underline">{p.title}</Link>
        <p className="mt-1 text-sm text-muted">{p.city} · {p.bedrooms} bed · {p.bathrooms} bath · {p.sizeM2} m2</p>
        <p className="mt-1 text-sm font-bold text-strawberry">Inspection fee {eur(p.fee)} · Available</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/properties/${p.slug}`} className="btn-press rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-velvet">View details</Link>
          <Link href={`/properties/${p.slug}`} className="btn-press rounded-full bg-strawberry px-4 py-2 text-sm font-bold text-white">Book inspection</Link>
          {showSave && (
            <button
              onClick={onToggleSave}
              aria-pressed={saved}
              className={`btn-press rounded-full px-4 py-2 text-sm font-bold ${
                saved ? 'bg-velvet text-white' : 'border border-line bg-white text-velvet'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
