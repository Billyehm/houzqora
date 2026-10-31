'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * CameraZoom: scroll-controlled zoom, not a true 3D camera move.
 * The final interior is an aligned image transition (opacity and scale),
 * labelled honestly here. No timers, no autoplay, scrub only.
 * Reduced motion: final interior is shown statically, no pin.
 */
export default function CameraZoom() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const exteriorRef = useRef<HTMLDivElement | null>(null);
  const interiorRef = useRef<HTMLDivElement | null>(null);
  const firstHeadingRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
  const foregroundRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(exteriorRef.current, { scale: 1, opacity: 0 });
      gsap.set(interiorRef.current, { opacity: 1, scale: 1 });
      gsap.set(firstHeadingRef.current, { opacity: 0 });
      gsap.set(finalRef.current, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string, zoom: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(exteriorRef.current, { scale: 1 }, { scale: zoom, transformOrigin: '50% 85%', ease: 'none' }, 0)
          .to(foregroundRef.current, { yPercent: -18, ease: 'none' }, 0)
          .to(firstHeadingRef.current, { opacity: 0, y: -20, ease: 'none' }, 0.25)
          .fromTo(interiorRef.current, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, ease: 'none' }, 0.72)
          .to(exteriorRef.current, { opacity: 0, ease: 'none' }, 0.85)
          .fromTo(finalRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.85);
        return tl;
      };
      mm.add('(min-width: 1024px)', () => build('+=200%', 1.9));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('+=160%', 1.6));
      mm.add('(max-width: 639px)', () => build('+=120%', 1.35));
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Camera zoom"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-velvetdark"
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
    >
      <div ref={exteriorRef} className="absolute inset-0 will-change-transform">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop"
          alt="Modern house exterior in a three quarter view"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>
      <div ref={interiorRef} className="absolute inset-0 opacity-0 will-change-transform">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&auto=format&fit=crop"
          alt="Interior detail with floor to ceiling windows"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div ref={foregroundRef} className="absolute inset-x-0 bottom-0 h-40 bg-black/25" />
      <div ref={firstHeadingRef} className="absolute inset-x-0 bottom-16 px-6 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold text-white drop-shadow sm:text-5xl">Find a place that feels like yours.</h1>
        <p className="mx-auto mt-3 max-w-md text-white/90 drop-shadow">Scroll to move closer to the home.</p>
      </div>
      <div ref={finalRef} className="absolute inset-x-0 bottom-16 px-6 text-center opacity-0">
        <h2 className="mx-auto max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">Step inside the detail.</h2>
        <Link href="/properties" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore homes worth coming home to</Link>
      </div>
      <p className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-velvet">Netherlands rentals, monthly rent in euros</p>
    </section>
  );
}
