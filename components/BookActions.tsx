'use client';

import { useRouter } from 'next/navigation';
import { addMyHome, getDemoUser, setPendingSlug } from '@/lib/demo';

export default function BookActions({ slug }: { slug: string }) {
  const router = useRouter();

  const book = () => {
    if (!getDemoUser()) {
      setPendingSlug(slug);
      router.push('/signup');
      return;
    }
    addMyHome(slug);
    router.push('/my-homes');
  };

  const pay = () => {
    if (!getDemoUser()) {
      setPendingSlug(slug);
      router.push('/signup');
      return;
    }
    addMyHome(slug);
    router.push(`/checkout/${slug}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={pay} className="btn-press rounded-full bg-strawberry px-5 py-3 font-bold text-white shadow-[0_2px_0_rgba(230,59,78,0.3)]">Pay inspection fee</button>
      <button onClick={book} className="btn-press rounded-full bg-velvet px-5 py-3 font-bold text-white">Book inspection</button>
      <a href="/contact" className="btn-press rounded-full border border-white/40 px-5 py-3 font-bold text-white">Contact agent</a>
    </div>
  );
}
