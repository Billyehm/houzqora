'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { blueprintFinals, useRefreshPick } from '@/lib/scrollImages';
import CardScrollbars from './CardScrollbars';

gsap.registerPlugin(ScrollTrigger);


/*
 * BlueprintReveal: hybrid layered transition, stated honestly.
 * This is NOT a true 3D model. It is an inline SVG blueprint, then SVG
 * structural and material layers in the same viewBox, then landscaping,
 * then a photorealistic photo revealed with a clip and scale transition.
 * Layers share the same framing so the house stays aligned.
 * No timers, no autoplay, scrub only. Reduced motion shows the final photo.
 */
export default function BlueprintReveal() {
  const finalSrc = useRefreshPick(blueprintFinals);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blueprintRef = useRef<HTMLDivElement | null>(null);
  const structuralRef = useRef<HTMLDivElement | null>(null);
  const materialsRef = useRef<HTMLDivElement | null>(null);
  const environmentRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
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
      gsap.set([blueprintRef.current, structuralRef.current, materialsRef.current, environmentRef.current, firstHeadingRef.current], { opacity: 0 });
      gsap.set(finalRef.current, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
      gsap.set(finalHeadingRef.current, { opacity: 1, y: 0 });
      gsap.set([leftThumbRef.current, rightThumbRef.current], { yPercent: 300 });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Calibration: pin the whole section, not just the card, so the
      // section padding and the arrow below the card are pinned with
      // it and cannot drift while the animation plays. The section is
      // viewport height and centred, so the card sits where it did
      // before, about 12 percent down the viewport when pinned.
      // End distance is card height times the multiplier, not a
      // percentage of the trigger, so the timeline runs exactly 0 to 1
      // over the pin distance even though the trigger is now taller.
      const build = (multiplier: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${card.offsetHeight * multiplier}`,
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(structuralRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, transformOrigin: '50% 100%', ease: 'none' }, 0.15)
          .to(firstHeadingRef.current, { opacity: 0, y: -20, ease: 'none' }, 0.12)
          .fromTo(materialsRef.current, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.35)
          .to(blueprintRef.current, { opacity: 0, ease: 'none' }, 0.35)
          .to(structuralRef.current, { opacity: 0.25, ease: 'none' }, 0.45)
          .fromTo(environmentRef.current, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.55)
          .fromTo(finalRef.current, { opacity: 0, scale: 1.08, clipPath: 'inset(100% 0% 0% 0%)' }, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0.8)
          .fromTo(finalHeadingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.85);
        // Both scrollbar thumbs share this one tween, so left and right
        // always sit at the same position and follow pinned progress.
        tl.to([leftThumbRef.current, rightThumbRef.current], { yPercent: 300, ease: 'none', duration: tl.duration() }, 0);
      };
      mm.add('(min-width: 1024px)', () => build(4.5));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build(3.3));
      mm.add('(max-width: 639px)', () => build(2.4));
    }, section);
    return () => {
      ctx.revert();
    };
  }, []);

  const svgProps = { viewBox: '0 0 800 520', className: 'h-full w-full', preserveAspectRatio: 'xMidYMid meet' } as const;

  return (
    <section ref={sectionRef} aria-label="Blueprint to reality" className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="relative h-[62vh] min-h-[460px] w-full overflow-hidden rounded-3xl border border-line bg-[#102a43] text-white shadow-[0_24px_60px_rgba(94,18,32,0.25)] sm:h-[68vh] sm:min-h-[500px] lg:h-[min(72vh,720px)]"
      >
      <div ref={blueprintRef} className="absolute inset-0 p-4 sm:p-10">
        <svg {...svgProps}>
          <defs>
            <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3a5a7a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="520" fill="url(#bp-grid)" />
          <g fill="none" stroke="#e8f2f8" strokeWidth="1.5">
            <rect x="200" y="140" width="400" height="260" />
            <line x1="360" y1="140" x2="360" y2="400" />
            <line x1="200" y1="280" x2="600" y2="280" />
            <rect x="220" y="160" width="120" height="100" strokeDasharray="6 4" />
            <rect x="380" y="160" width="200" height="100" strokeDasharray="6 4" />
            <rect x="220" y="300" width="120" height="80" strokeDasharray="6 4" />
            <rect x="380" y="300" width="200" height="80" strokeDasharray="6 4" />
            <line x1="200" y1="430" x2="600" y2="430" />
            <line x1="200" y1="424" x2="200" y2="436" />
            <line x1="600" y1="424" x2="600" y2="436" />
          </g>
          <g fill="#bcd6e6" fontSize="13" fontFamily="sans-serif">
            <text x="230" y="180">LIVING</text>
            <text x="390" y="180">KITCHEN</text>
            <text x="230" y="320">BEDROOM</text>
            <text x="390" y="320">BEDROOM</text>
            <text x="380" y="452">12.4 m</text>
            <text x="640" y="280">8.2 m</text>
            <text x="30" y="40">PLAN A, MODERN HOUSE, SCALE 1:100</text>
            <text x="30" y="490">NORTH ELEVATION, GLASS FRONT, FLAT ROOF OPTION</text>
          </g>
        </svg>
      </div>
      <div ref={structuralRef} className="absolute inset-0 p-4 opacity-0 sm:p-10">
        <svg {...svgProps}>
          <g fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="square">
            <rect x="200" y="140" width="400" height="260" />
            <line x1="360" y1="140" x2="360" y2="400" />
            <line x1="200" y1="280" x2="600" y2="280" />
          </g>
          <g fill="none" stroke="#7fb3d5" strokeWidth="3">
            <rect x="180" y="410" width="440" height="18" />
          </g>
        </svg>
      </div>
      <div ref={materialsRef} className="absolute inset-0 p-4 opacity-0 sm:p-10">
        <svg {...svgProps}>
          <polygon points="180,140 400,55 620,140" fill="#3a444e" />
          <rect x="200" y="140" width="400" height="260" fill="#d8d2c8" />
          <rect x="220" y="160" width="120" height="100" fill="#bcd6de" stroke="#5E1220" strokeWidth="3" />
          <rect x="380" y="160" width="200" height="100" fill="#e8e2d6" />
          <rect x="220" y="300" width="120" height="80" fill="#8a6a4a" />
          <rect x="380" y="300" width="200" height="80" fill="#bcd6de" stroke="#5E1220" strokeWidth="3" />
          <rect x="470" y="300" width="60" height="100" fill="#5E1220" />
        </svg>
      </div>
      <div ref={environmentRef} className="absolute inset-0 p-4 opacity-0 sm:p-10">
        <svg {...svgProps}>
          <rect x="0" y="400" width="800" height="120" fill="#6a8f5a" opacity="0.9" />
          <rect x="530" y="400" width="80" height="120" fill="#b8a88f" />
          <circle cx="130" cy="360" r="34" fill="#4d7a45" />
          <circle cx="680" cy="350" r="28" fill="#4d7a45" />
          <circle cx="700" cy="90" r="30" fill="#f2d98c" opacity="0.9" />
        </svg>
      </div>
      <div ref={finalRef} className="absolute inset-0 opacity-0">
        <Image
          src={finalSrc}
          alt="Finished modern house, photorealistic exterior"
          fill
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover"
          priority
        />
      </div>
      <div ref={firstHeadingRef} className="absolute inset-x-0 top-10 px-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#bcd6e6]">From drawing to home</p>
        <h2 className="mx-auto mt-2 max-w-xl text-3xl font-extrabold sm:text-4xl">Every home begins with an idea.</h2>
      </div>
      <div ref={finalHeadingRef} className="absolute inset-x-0 bottom-12 px-6 text-center opacity-0">
        <h2 className="mx-auto max-w-xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">From vision to the place you will call home.</h2>
        <p className="mx-auto mt-3 max-w-md text-white/90 drop-shadow">Discover properties designed for the way you want to live.</p>
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
