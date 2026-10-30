import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/CheckoutClient';
import { getProperty, properties } from '@/lib/properties';

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const p = getProperty(params.slug);
  if (!p) notFound();
  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <h1 className="text-3xl font-extrabold text-velvet">Checkout: {p.title}</h1>
      <p className="mt-2 text-muted">{p.city} · Inspection fee is per property and non-refundable. Paying it does not reserve this home.</p>
      <div className="mt-5"><CheckoutClient p={p} /></div>
    </div>
  );
}
