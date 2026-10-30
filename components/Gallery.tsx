'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-2xl border-4 border-white shadow-[0_18px_40px_rgba(94,18,32,0.16)] sm:h-96">
        <Image src={images[active]} alt={title} fill sizes="(max-width: 640px) 100vw, 60vw" className="object-cover" priority />
      </div>
      <div className="mt-3 flex gap-2">
        {images.map((src, i) => (
          <button key={src} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} className={`btn-press relative h-20 w-28 overflow-hidden rounded-xl border-2 ${active === i ? 'border-strawberry' : 'border-white'}`}>
            <Image src={src} alt="" fill sizes="112px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
