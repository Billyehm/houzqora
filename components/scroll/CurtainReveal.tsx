'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * CurtainReveal: scroll-controlled, reversible curtain opening.
 * No timers, no autoplay. Scroll progress alone moves the curtains.
 * Reduced motion: curtains are set open and no pin is used.
 * Fold texture is layered repeating gradients and shadows, not flat blocks.
 */
const foldStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #f7efdd 0px, #f7efdd 20px, #e3d3ae 34px, #fbf6ea 50px, #d9c79c 66px, #f7efdd 82px)',
};

export default function CurtainReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(leftRef.current, { xPercent: -88, scaleX: 0.35 });
      gsap.set(rightRef.current, { xPercent: 88, scaleX: 0.35 });
      gsap.set([veilRef.current, hintRef.current], { opacity: 0 });
      gsap.set(headingRef.current, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const build = (end: string) => {
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
          .to(hintRef.current, { opacity: 0, ease: 'none' }, 0.1)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.75);
        return tl;
      };
      mm.add('(min-width: 1024px)', () => build('+=200%'));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build('+=160%'));
      mm.add('(max-width: 639px)', () => build('+=120%'));
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Curtain reveal"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-velvetdark"
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
    >
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80&auto=format&fit=crop"
          alt="Modern living room with floor to ceiling windows and an outdoor view"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div ref={veilRef} className="absolute inset-0 bg-velvetdark/50" />
      <div className="absolute inset-0" style={{ perspective: '1000px' }}>
        <div
          ref={leftRef}
          className="absolute inset-y-0 left-0 w-1/2 border-r border-black/20 shadow-[inset_-24px_0_40px_rgba(0,0,0,0.25)]"
          style={{ ...foldStyle, transformOrigin: 'left center' }}
        />
        <div
          ref={rightRef}
          className="absolute inset-y-0 right-0 w-1/2 border-l border-black/20 shadow-[inset_24px_0_40px_rgba(0,0,0,0.25)]"
          style={{ ...foldStyle, transformOrigin: 'right center' }}
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-2 bg-velvetdark" />
      <div ref={headingRef} className="absolute inset-x-0 bottom-16 px-6 text-center opacity-0">
        <h2 className="mx-auto max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-5xl">{"There's a place waiting for you."}</h2>
        <p className="mx-auto mt-3 max-w-md text-white/90 drop-shadow">Explore exceptional homes in locations you will love.</p>
        <Link href="/properties" className="btn-press mt-5 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Explore available homes</Link>
      </div>
      <p ref={hintRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-velvet">Scroll to draw the curtains back</p>
    </section>
  );
}
