'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * WindowReveal: scroll-controlled, reversible window opening.
 * No timers, no autoplay. Every movement comes from ScrollTrigger scrub.
 * Reduced motion: panels are set to their open position and no pin is used.
 */
export default function WindowReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const reflectionRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set([leftRef.current, rightRef.current], { clearProps: 'all' });
      gsap.set(leftRef.current, { xPercent: -105 });
      gsap.set(rightRef.current, { xPercent: 105 });
      gsap.set([veilRef.current, reflectionRef.current, hintRef.current], { opacity: 0 });
      gsap.set(headingRef.current, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string, rotate: number) => {
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
        tl.to(leftRef.current, { xPercent: -110, rotateY: -rotate, transformPerspective: 1000, ease: 'none' }, 0)
          .to(rightRef.current, { xPercent: 110, rotateY: rotate, transformPerspective: 1000, ease: 'none' }, 0)
          .to(reflectionRef.current, { opacity: 0, ease: 'none' }, 0)
          .to(veilRef.current, { opacity: 0, ease: 'none' }, 0)
          .to(hintRef.current, { opacity: 0, ease: 'none' }, 0.1)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.7);
        return tl;
      };
      mm.add('(min-width: 1024px)', () => build('+=200%', 18));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('+=160%', 12));
      mm.add('(max-width: 639px)', () => build('+=120%', 8));
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Window reveal"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-velvetdark"
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
    >
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&auto=format&fit=crop"
          alt="Bright modern living room with floor to ceiling windows"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div ref={veilRef} className="absolute inset-0 bg-velvetdark/40" />
      <div ref={reflectionRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-[18%] w-16 -skew-x-12 bg-white/25" />
        <div className="absolute inset-y-0 left-[62%] w-8 -skew-x-12 bg-white/20" />
      </div>
      <div className="absolute inset-0 flex" style={{ perspective: '1200px' }}>
        <div ref={leftRef} className="relative h-full w-1/2 border-r-4 border-velvetdark bg-[#d7dee0]/95">
          <div className="absolute inset-y-0 right-0 w-1 bg-velvetdark/30" />
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
        </div>
        <div ref={rightRef} className="relative h-full w-1/2 border-l-4 border-velvetdark bg-[#d7dee0]/95">
          <div className="absolute inset-y-0 left-0 w-1 bg-velvetdark/30" />
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-3 bg-velvetdark" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-velvetdark" />
      <div ref={headingRef} className="absolute inset-x-0 bottom-16 px-6 text-center opacity-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-strawberry">Inside the home</p>
        <h2 className="mx-auto mt-2 max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">Light, space, and room to breathe.</h2>
        <Link href="/properties" className="btn-press mt-4 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
      </div>
      <p ref={hintRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-velvet">Scroll to open the windows</p>
    </section>
  );
}
