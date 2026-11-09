'use client';

import { useRouter } from 'next/navigation';

// The in-app twin of the phone back button: it returns to the
// page the visitor came from, with that page's place kept.
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="btn-press mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-velvet"
    >
      <span aria-hidden="true">←</span> Back
    </button>
  );
}
