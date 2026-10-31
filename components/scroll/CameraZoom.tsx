'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cameraPairs, useRefreshPick } from '@/lib/scrollImages';
import CardScrollbars from './CardScrollbars';

gsap.registerPlugin(ScrollTrigger);

/*
 * CameraZoom: scroll-controlled zoom, inside a card, not fullscreen.
 * This is an aligned image transition, not a true 3D camera move.
 * No timers, no autoplay. Scroll progress alone moves the zoom.
 * Reduced motion shows the final interior statically, with no pin.
 * The exterior/interior pair is picked once on client mount from
 * cameraPairs, so it only changes on page refresh, never on scroll.
 */
export default function CameraZoom() {
  const pair = useRefreshPick(cameraPairs);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const exteriorRef = useRef<HTMLDivElement | null>(null);
  const interiorRef = useRef<HTMLDivElement | null>(null);
  const firstHeadingRef = useRef<HTMLDivElement | null>(null);
  const finalHeadingRef = useRef<HTMLDivElement | null>(null);
  const leftThumbRef = useRef<HTMLDivElement | null>(null);
  const rightThumbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(exteriorRef.current, { opacity: 0, scale: 1 });
      gsap.set(interiorRef.current, { opacity: 1, scale: 1 });
      gsap.set(firstHeadingRef.current, { opacity: 0 });
      gsap.set(finalHeadingRef.current, { opacity: 1, y: 0 });
      gsap.set([leftThumbRef.current, rightThumbRef.current], { yPercent: 300 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string, zoom: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 12%',
            end,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(exteriorRef.current, { scale: zoom, transformOrigin: '50% 85%', yPercent: -4, ease: 'none' }, 0)
          .to(firstHeadingRef.current, { opacity: 0, y: -20, ease: 'none' }, 0.35)
          .fromTo(interiorRef.current, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, ease: 'none' }, 0.72)
          .to(exteriorRef.current, { opacity: 0, ease: 'none' }, 0.85)
          .fromTo(finalHeadingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.85);
        // Both scrollbar thumbs share this one tween, so left and right
        // always sit at the same position and follow pinned progress.
        tl.to([leftThumbRef.current, rightThumbRef.current], { yPercent: 300, ease: 'none', duration: tl.duration() }, 0);
        return tl;
      };
      mm.add('(min-width: 1024px)', () => build('+=200%', 1.9));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('+=160%', 1.6));
      mm.add('(max-width: 639px)', () => build('+=120%', 1.35));
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label="Camera zoom" className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl border border-line bg-velvetdark shadow-[0_24px_60px_rgba(94,18,32,0.25)] sm:h-[68vh] sm:min-h-[480px] lg:h-[min(72vh,720px)]"
      >
        <div ref={exteriorRef} className="absolute inset-0">
          <Image
            src={pair.exterior}
            alt={pair.exteriorAlt}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
            priority
          />
        </div>
        <div ref={interiorRef} className="absolute inset-0 opacity-0">
          <Image
            src={pair.interior}
            alt={pair.interiorAlt}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
        <div ref={firstHeadingRef} className="absolute inset-x-0 top-10 px-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/90 drop-shadow">Wide view, then closer</p>
          <h2 className="mx-auto mt-2 max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">Find a place that feels like yours.</h2>
        </div>
        <div ref={finalHeadingRef} className="absolute inset-x-0 bottom-12 px-6 text-center opacity-0">
          <h2 className="mx-auto max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">Explore homes worth coming home to.</h2>
          <Link href="/properties" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
        </div>
        <div aria-hidden="true" className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2">
          <div className="flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-black/45 text-white shadow ring-1 ring-white/40 motion-reduce:animate-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
        <CardScrollbars leftThumbRef={leftThumbRef} rightThumbRef={rightThumbRef} />
      </div>
    </section>
  );
}
