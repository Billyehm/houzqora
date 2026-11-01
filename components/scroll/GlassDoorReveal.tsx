'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { glassDoorInteriors, useRefreshPick } from '@/lib/scrollImages';
import CardScrollbars from './CardScrollbars';

gsap.registerPlugin(ScrollTrigger);


/*
 * GlassDoorReveal: scroll-controlled, reversible frosted glass sliding doors,
 * inside a card. The card is pinned, not a full-screen scene.
 * No timers, no autoplay. Scroll progress alone moves the doors.
 * Reduced motion: doors are set open inside the card and no pin is used.
 * The doors are translucent frosted glass, not opaque: the interior behind
 * them is visible but blurred through backdrop-filter blur, and unreadable
 * until the doors slide apart and the interior becomes fully clear.
 * Frost texture is fine vertical frost lines plus a faint diagonal
 * reflection stripe, not a flat block. Frames are dark slim aluminium,
 * with top and bottom sliding tracks.
 */
const frostStyle: React.CSSProperties = {
  backgroundColor: 'rgba(232, 236, 236, 0.62)',
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 5px, rgba(210,218,218,0.45) 7px, rgba(255,255,255,0.5) 10px, rgba(225,230,230,0.5) 14px, rgba(255,255,255,0.55) 18px)',
  backdropFilter: 'blur(14px) saturate(1.1)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
};

export default function GlassDoorReveal() {
  const interiorSrc = useRefreshPick(glassDoorInteriors);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
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
      gsap.set(leftRef.current, { xPercent: -88, scaleX: 0.35 });
      gsap.set(rightRef.current, { xPercent: 88, scaleX: 0.35 });
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
        // 0 percent closed, 25 percent narrow opening, 50 percent apart,
        // 75 percent mostly visible, 100 percent fully open and bunched at edges.
        tl.to(leftRef.current, { xPercent: -16, scaleX: 0.95, ease: 'none' }, 0)
          .to(rightRef.current, { xPercent: 16, scaleX: 0.95, ease: 'none' }, 0)
          .to(leftRef.current, { xPercent: -48, scaleX: 0.75, ease: 'none' }, 0.25)
          .to(rightRef.current, { xPercent: 48, scaleX: 0.75, ease: 'none' }, 0.25)
          .to(leftRef.current, { xPercent: -78, scaleX: 0.5, rotateY: -10, transformPerspective: 900, ease: 'none' }, 0.5)
          .to(rightRef.current, { xPercent: 78, scaleX: 0.5, rotateY: 10, transformPerspective: 900, ease: 'none' }, 0.5)
          .to(leftRef.current, { xPercent: -90, scaleX: 0.35, ease: 'none' }, 0.75)
          .to(rightRef.current, { xPercent: 90, scaleX: 0.35, ease: 'none' }, 0.75)
          .to(veilRef.current, { opacity: 0, ease: 'none' }, 0)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.75);
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

  const doorFrame = 'border-[#2b2f33]';
  return (
    <section ref={sectionRef} aria-label="Glass door reveal" className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl border border-line bg-velvetdark shadow-[0_24px_60px_rgba(94,18,32,0.25)] sm:h-[68vh] sm:min-h-[480px] lg:h-[min(72vh,720px)]"
      >
        <div className="absolute inset-0">
          <Image
            src={interiorSrc}
            alt="Modern living room with floor to ceiling windows and an outdoor view"
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
        <div ref={veilRef} className="absolute inset-0 bg-velvetdark/50" />
        <div className="absolute inset-0" style={{ perspective: '1000px' }}>
          <div
            ref={leftRef}
            className={`absolute inset-y-0 left-0 w-1/2 border-4 ${doorFrame} shadow-[inset_-24px_0_40px_rgba(0,0,0,0.28)]`}
            style={{ ...frostStyle, transformOrigin: 'left center' }}
          >
            <div className="pointer-events-none absolute inset-y-0 left-[20%] w-10 -skew-x-12 bg-white/40" />
            <div className="absolute inset-y-0 right-0 w-1 bg-black/30" />
            <div className="absolute right-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[#3a3f44] shadow" />
            <div className="absolute inset-x-0 top-0 h-1 bg-white/50" />
          </div>
          <div
            ref={rightRef}
            className={`absolute inset-y-0 right-0 w-1/2 border-4 ${doorFrame} shadow-[inset_24px_0_40px_rgba(0,0,0,0.28)]`}
            style={{ ...frostStyle, transformOrigin: 'right center' }}
          >
            <div className="pointer-events-none absolute inset-y-0 left-[55%] w-8 -skew-x-12 bg-white/35" />
            <div className="absolute inset-y-0 left-0 w-1 bg-black/30" />
            <div className="absolute left-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[#3a3f44] shadow" />
            <div className="absolute inset-x-0 top-0 h-1 bg-white/50" />
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 z-10 h-2 bg-[#2b2f33]" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-[#2b2f33]" />
        <div ref={headingRef} className="absolute inset-x-0 bottom-12 px-6 text-center opacity-0">
          <h2 className="mx-auto max-w-xl text-2xl font-extrabold text-white drop-shadow sm:text-5xl">{"There's a place waiting for you."}</h2>
          <p className="mx-auto mt-3 max-w-md text-white/90 drop-shadow">{"Explore exceptional homes in locations you'll love."}</p>
          <Link href="/properties" className="btn-press mt-5 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
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
