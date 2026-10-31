'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { windowInteriors, windowWalls, useRefreshPick } from '@/lib/scrollImages';

gsap.registerPlugin(ScrollTrigger);

/*
 * WindowReveal: one single window on a realistic painted house wall,
 * inside a card. The wall stays in place for the whole animation.
 * Only the window pane moves, and it moves vertically upwards.
 * Initially the pane covers the window opening. As scroll progress
 * rises, the pane slides up out of the frame and the luxury living
 * room behind it is revealed through the opening. Scrolling up
 * slides the pane back down and closes it again.
 * No timers, no autoplay. Scroll progress alone moves the pane.
 * Reduced motion: the pane is set to its open position, with no pin.
 * Wall and interior images are picked once on client mount, so they
 * only change on page refresh, never during scrolling.
 */
export default function WindowReveal() {
  const wallSrc = useRefreshPick(windowWalls);
  const interiorSrc = useRefreshPick(windowInteriors);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(paneRef.current, { yPercent: -110 });
      gsap.set([veilRef.current, hintRef.current], { opacity: 0 });
      gsap.set(headingRef.current, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string) => {
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
        tl.to(paneRef.current, { yPercent: -110, ease: 'none' }, 0)
          .to(veilRef.current, { opacity: 0, ease: 'none' }, 0)
          .to(hintRef.current, { opacity: 0, ease: 'none' }, 0.1)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.7);
        return tl;
      };
      mm.add('(min-width: 1024px)', () => build('+=200%'));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('+=160%'));
      mm.add('(max-width: 639px)', () => build('+=120%'));
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label="Window reveal" className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl border border-line bg-velvetdark shadow-[0_24px_60px_rgba(94,18,32,0.25)] sm:h-[68vh] sm:min-h-[480px] lg:h-[min(72vh,720px)]"
      >
        <div className="absolute inset-0">
          <Image
            src={wallSrc}
            alt="Realistic painted house wall, warm neutral paint with visible wall texture"
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="absolute left-1/2 top-1/2 w-[78%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 sm:w-[64%] lg:w-[52%]">
          <div className="relative h-[46vh] min-h-[280px] overflow-hidden border-[10px] border-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:h-[50vh] lg:h-[52vh] lg:max-h-[500px]">
            <div className="absolute inset-0">
              <Image
                src={interiorSrc}
                alt="Luxury living room interior seen through the window"
                fill
                sizes="(max-width: 560px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            <div ref={veilRef} className="absolute inset-0 bg-velvetdark/25" />
            <div ref={paneRef} className="absolute inset-0 bg-[#dbe7ea]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-[#cfe0e6]/90 to-[#aebfC6]/90" />
              <div className="pointer-events-none absolute inset-y-0 left-[18%] w-12 -skew-x-12 bg-white/50" />
              <div className="pointer-events-none absolute inset-y-0 left-[62%] w-6 -skew-x-12 bg-white/40" />
              <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-white shadow" />
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-white shadow" />
              <div className="absolute inset-0 border-[6px] border-white/90" />
              <div className="absolute bottom-4 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-[#3a3f44] shadow" />
            </div>
            <div className="pointer-events-none absolute inset-0 border-2 border-black/10" />
          </div>
          <div className="mx-auto -mt-1 h-3 w-[112%] max-w-[620px] -translate-x-[5%] rounded-b-lg bg-white shadow-[0_10px_25px_rgba(0,0,0,0.35)]" />
        </div>

        <div ref={headingRef} className="absolute inset-x-0 bottom-10 px-6 text-center opacity-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white drop-shadow">Inside the home</p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-extrabold text-white drop-shadow sm:text-4xl">Light, space, and room to breathe.</h2>
          <Link href="/properties" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
        </div>
        <p ref={hintRef} className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-velvet">Scroll to open the window upwards</p>
      </div>
    </section>
  );
}
