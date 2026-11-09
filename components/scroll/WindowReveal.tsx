'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { windowInteriors, windowWalls, useRefreshPick } from '@/lib/scrollImages';
import CardScrollbars from './CardScrollbars';

gsap.registerPlugin(ScrollTrigger);

// Layout effect on the client, plain effect on the server, so pin
// spacers and starting transforms are in place before first paint
// and the page does not visibly re-arrange itself on reload.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;


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

  useIsomorphicLayoutEffect(() => {
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
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(paneRef.current, { yPercent: -110, ease: 'none' }, 0)
          .to(veilRef.current, { opacity: 0, ease: 'none' }, 0)
          .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none' }, 0.7);
        // Both scrollbar thumbs share this one tween, so left and right
        // always sit at the same position and follow pinned progress.
        tl.to([leftThumbRef.current, rightThumbRef.current], { yPercent: 300, ease: 'none', duration: tl.duration() }, 0);
      };
      mm.add('(min-width: 1024px)', () => build(6));
      mm.add('(min-width: 640px) and (max-width: 1023px)', () => build(4.8));
      mm.add('(max-width: 639px)', () => build(3.6));
    }, section);
    return () => {
      ctx.revert();
    };
  }, []);
  // Re-measure pin positions when the discount ribbon appears,
  // disappears, or switches, since that shifts everything below it.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('houzqora-banner-change', refresh);
    return () => window.removeEventListener('houzqora-banner-change', refresh);
  }, []);

  return (
    <section ref={sectionRef} aria-label="Window reveal" className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="relative h-[62vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-line bg-velvetdark shadow-[0_24px_60px_rgba(94,18,32,0.25)] sm:h-[68vh] sm:min-h-[480px] lg:h-[min(72vh,720px)]"
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
          {/* Reveal: the wall opening has depth, so the ring between wall
              and frame is a recessed reveal, not a flat dark border. The
              top of the reveal sits in shadow, the sides catch light, and
              the thin light line on the top outer edge is the wall edge
              catching light, so the frame reads as set into the wall
              rather than hung on it. The wall texture runs continuously
              right up to this groove. The big soft drop shadow below the
              whole assembly is gone on purpose: a recessed window does
              not cast one, only the reveal and the sill cast shadows. */}
          <div
            className="relative p-[10px] shadow-[0_-1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.4),0_10px_24px_rgba(0,0,0,0.35),inset_0_5px_12px_rgba(0,0,0,0.55),inset_0_-4px_10px_rgba(0,0,0,0.4),inset_4px_0_10px_rgba(0,0,0,0.3),inset_-4px_0_10px_rgba(0,0,0,0.3)]"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.34) 28%, rgba(0,0,0,0.26) 68%, rgba(0,0,0,0.5) 100%)',
            }}
          >
            {/* Brownish wooden frame: wood gradient with grain streaks.
                The grain shows only on the frame ring, because the inner
                opening covers the centre with the interior image. */}
            <div
              className="relative h-[46vh] min-h-[280px] border border-black/50 p-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.5)] sm:h-[50vh] lg:h-[52vh] lg:max-h-[500px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(93deg, rgba(60,35,15,0.22) 0 1px, transparent 1px 9px), linear-gradient(135deg, #8a5a33 0%, #6e4423 40%, #7d4e28 60%, #5a371d 100%)',
              }}
            >
            <div className="relative h-full w-full overflow-hidden shadow-[inset_0_4px_14px_rgba(0,0,0,0.4)]">
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
              {/* Real glass, not a painted panel: mostly transparent, so the
                  room shows dimly through it, with a slight blur and a
                  faint cool tint, the way glass actually looks. */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(214,228,232,0.38) 0%, rgba(186,200,206,0.22) 35%, rgba(148,166,174,0.30) 70%, rgba(96,110,117,0.42) 100%)',
                  backdropFilter: 'blur(1.5px) brightness(0.92)',
                  WebkitBackdropFilter: 'blur(1.5px) brightness(0.92)',
                }}
              />
              {/* Soft, blurred reflections, not a sharp cartoon stripe. */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/4 top-[-20%] h-[140%] w-[38%] rotate-[18deg] bg-white/20 blur-xl" />
                <div className="absolute left-[55%] top-[-10%] h-[120%] w-[12%] rotate-[18deg] bg-white/10 blur-lg" />
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
              {/* Muntin bars with depth: light on one edge, shadow on the other,
                  so they read as real bars, not flat drawn lines. */}
              <div
                className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 shadow-[1px_0_3px_rgba(0,0,0,0.45),-1px_0_2px_rgba(255,255,255,0.25)]"
                style={{ background: 'linear-gradient(to right, #9a6a3d, #6e4423, #4a2e17)' }}
              />
              <div
                className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 shadow-[0_1px_3px_rgba(0,0,0,0.45),0_-1px_2px_rgba(255,255,255,0.25)]"
                style={{ background: 'linear-gradient(to bottom, #9a6a3d, #6e4423, #4a2e17)' }}
              />
              {/* Sash frame, same brownish wood as the outer frame, with a
                  bevel, and a thicker bottom rail, as a real sliding
                  sash has. */}
              <div className="absolute inset-0 border-[8px] border-[#6e4423] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)]" />
              <div
                className="absolute inset-x-0 bottom-0 h-[18px] shadow-[0_-2px_6px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.25)]"
                style={{ background: 'linear-gradient(to bottom, #8a5a33, #5a371d)' }}
              />
              {/* Realistic lever handle: metal plate with screws, and a
                  rounded lever, not a flat stick. */}
              <div className="absolute bottom-6 right-6 flex items-center gap-1">
                <div className="flex h-10 w-4 flex-col items-center justify-between rounded-sm py-1 shadow-[0_2px_5px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to right, #e8ecef, #9aa0a5, #6d7276)' }}>
                  <span className="h-1 w-1 rounded-full bg-[#4a4f53]" />
                  <span className="h-1 w-1 rounded-full bg-[#4a4f53]" />
                </div>
                <div className="h-3 w-10 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to bottom, #f2f4f5, #aeb3b8, #6d7276)' }} />
              </div>
              {/* Glass edge: a faint green-grey tint and inner depth. */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25),inset_0_0_4px_rgba(120,150,140,0.35)]" />
            </div>
            <div className="pointer-events-none absolute inset-0 border border-black/25 shadow-[inset_0_6px_18px_rgba(0,0,0,0.45),inset_0_-4px_12px_rgba(0,0,0,0.3)]" />
            </div>
            </div>
            {/* Sill, same brownish wood as the frame, part of the same
                assembly: no gap between frame and sill. Its top surface
                is lit, its underside is dark, and it sits on the wall,
                so the wall directly beneath it is in hard shadow that
                softens as it falls away. */}
            <div
              className="mx-auto -mt-1 h-4 w-[108%] max-w-[600px] -translate-x-[4%] rounded-b-md shadow-[0_12px_25px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.28)]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(93deg, rgba(60,35,15,0.22) 0 1px, transparent 1px 9px), linear-gradient(to bottom, #8a5a33, #6e4423)',
              }}
            />
            <div aria-hidden="true" className="mx-auto h-[5px] w-[108%] max-w-[600px] -translate-x-[4%] bg-black/50 blur-[2px]" />
            <div aria-hidden="true" className="mx-auto mt-1 h-5 w-[80%] rounded-full bg-black/35 blur-md" />
          </div>
        </div>

        <div ref={headingRef} className="absolute inset-x-0 bottom-14 px-6 text-center opacity-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white drop-shadow">Inside the home</p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-extrabold text-white drop-shadow sm:text-4xl">Light, space, and room to breathe.</h2>
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
