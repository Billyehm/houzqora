'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { windowInteriors, windowWalls, useRefreshPick } from '@/lib/scrollImages';
import CardScrollbars from './CardScrollbars';

gsap.registerPlugin(ScrollTrigger);


/*
 * WindowReveal: one single window on a plain wall surface,
 * inside a card. No house, roof, ground, or foreground scene.
 * The wall stays in place for the whole animation.
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
  const wall = useRefreshPick(windowWalls);
  const wallSrc = wall.src;
  const interiorSrc = useRefreshPick(windowInteriors);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const leftThumbRef = useRef<HTMLDivElement | null>(null);
  const rightThumbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(paneRef.current, { yPercent: -110 });
      gsap.set(veilRef.current, { opacity: 0 });
      gsap.set(headingRef.current, { opacity: 1, y: 0 });
      gsap.set([leftThumbRef.current, rightThumbRef.current], { yPercent: 300 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 12%',
            end: `+=${end}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });
        tl.to(paneRef.current, { yPercent: -110, ease: 'none' }, 0)
          .to(veilRef.current, { opacity: 0, ease: 'none' }, 0)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.7);
        // Both scrollbar thumbs share this one tween, so left and right
        // always sit at the same position and follow pinned progress.
        tl.to([leftThumbRef.current, rightThumbRef.current], { yPercent: 300, ease: 'none', duration: tl.duration() }, 0);
      };
      mm.add('(min-width: 1024px)', () => build('200%'));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('160%'));
      mm.add('(max-width: 639px)', () => build('120%'));
    }, section);
    return () => {
      ctx.revert();
    };
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
            alt={`${wall.label} wall texture filling the card edge to edge, no house or outdoor scene`}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          {wall.tint && (
            <>
              <div className="absolute inset-0" style={{ backgroundColor: wall.tint, mixBlendMode: 'color', opacity: 0.95 }} />
              <div className="absolute inset-0" style={{ backgroundColor: wall.tint, opacity: 0.18 }} />
            </>
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 w-[78%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 sm:w-[64%] lg:w-[52%]">
          {/* Reveal groove: a thin shadowed step between wall and frame,
              so the window reads as set into the wall, not floating on it.
              The wall texture runs continuously right up to this groove. */}
          <div className="relative bg-black/30 p-[10px] shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
            <div className="relative h-[46vh] min-h-[280px] overflow-hidden border-[12px] border-[#f2efe9] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_4px_14px_rgba(0,0,0,0.4)] sm:h-[50vh] lg:h-[52vh] lg:max-h-[500px]">
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
            <div ref={paneRef} className="absolute inset-0">
              <div className="absolute inset-0 bg-[#c9d6da]/95 shadow-[inset_0_0_24px_rgba(0,0,0,0.25)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20" />
              <div className="pointer-events-none absolute inset-y-0 left-[30%] w-8 -skew-x-12 bg-white/25" />
              <div className="absolute inset-[10px] border border-[#e8e4dc] shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]" />
              <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#f2efe9] shadow-[1px_0_2px_rgba(0,0,0,0.4),-1px_0_2px_rgba(255,255,255,0.6)]" />
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#f2efe9] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_-1px_2px_rgba(255,255,255,0.6)]" />
              <div className="absolute inset-0 border-[6px] border-[#f2efe9] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]" />
              <div className="absolute bottom-5 right-5 flex flex-col items-center">
                <div className="h-2 w-4 rounded-full bg-[#6b7176] shadow" />
                <div className="h-9 w-[3px] bg-gradient-to-b from-[#9aa0a5] to-[#5c6165] shadow" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 border border-black/25 shadow-[inset_0_6px_18px_rgba(0,0,0,0.45),inset_0_-4px_12px_rgba(0,0,0,0.3)]" />
            </div>
            {/* Sill, part of the same assembly: no gap between frame and sill,
                with a top edge shadow and a soft shadow falling onto the wall. */}
            <div className="mx-auto -mt-1 h-4 w-[108%] max-w-[600px] -translate-x-[4%] rounded-b-md bg-[#e8e4dc] shadow-[0_12px_25px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(0,0,0,0.3)]" />
            <div aria-hidden="true" className="mx-auto mt-1 h-5 w-[80%] rounded-full bg-black/35 blur-md" />
          </div>
        </div>

        <div ref={headingRef} className="absolute inset-x-0 bottom-14 px-6 text-center opacity-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white drop-shadow">Inside the home</p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-extrabold text-white drop-shadow sm:text-4xl">Light, space, and room to breathe.</h2>
          <Link href="/properties" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
        </div>
        <CardScrollbars leftThumbRef={leftThumbRef} rightThumbRef={rightThumbRef} />
      </div>
      <div aria-hidden="true" className="mt-4 flex justify-center">
        <div className="flex h-8 w-8 animate-bounce items-center justify-center text-[#5E1220] motion-reduce:animate-none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>
    </section>
  );
}
