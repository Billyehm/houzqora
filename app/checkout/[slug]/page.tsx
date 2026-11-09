import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/CheckoutClient';
import BackButton from '@/components/BackButton';
import { properties } from '@/lib/properties';
import { fetchProperty } from '@/lib/queries';

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const p = await fetchProperty(params.slug);
  if (!p) notFound();
  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <BackButton />
      <h1 className="text-3xl font-extrabold text-velvet">Checkout: {p.title}</h1>
      <p className="mt-2 text-muted">{p.city} · Inspection fee is per property and non-refundable. Confirming it does not reserve this home.</p>
      <div className="mt-5"><CheckoutClient p={p} /></div>
    </div>
  );
}
