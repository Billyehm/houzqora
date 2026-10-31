'use client';

/* Thumb refs are plain { current } holders so the component works with
 * the React version in this app, where RefObject nullability differs. */

/*
 * CardScrollbars: the identical fancy scrollbar pair used by every
 * animation card. One slim track near the left edge and one near the
 * right edge, each with a short rounded thumb. Both thumbs are driven
 * from the same source in the owning card: a single GSAP timeline
 * tween that moves both thumbs together, so the left and right thumbs
 * always sit at the same vertical position. The thumb is 25 percent
 * of the track height, so yPercent 300 moves it exactly to the bottom
 * of the track (travel is 75 percent of the track, which is three
 * times the thumb height). No timers, no scroll listeners, no
 * instructional text. Purely decorative, aria-hidden.
 */
type ThumbRef = { current: HTMLDivElement | null };

type CardScrollbarsProps = {
  leftThumbRef: ThumbRef;
  rightThumbRef: ThumbRef;
};

function Track({ side, thumbRef }: { side: 'left' | 'right'; thumbRef: ThumbRef }) {
  const position = side === 'left' ? 'left-3 sm:left-4' : 'right-3 sm:right-4';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-20 h-[72%] w-[6px] -translate-y-1/2 rounded-full bg-white/30 shadow-[0_0_8px_rgba(0,0,0,0.35)] ${position}`}
    >
      <div
        ref={(el) => {
          thumbRef.current = el;
        }}
        className="absolute left-0 top-0 h-1/4 w-full rounded-full bg-gradient-to-b from-[#5E1220] to-[#E63B4E] shadow-[0_0_12px_rgba(230,59,78,0.55),0_2px_6px_rgba(0,0,0,0.4)] ring-1 ring-white/40"
      >
        <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" />
      </div>
    </div>
  );
}

export default function CardScrollbars({ leftThumbRef, rightThumbRef }: CardScrollbarsProps) {
  return (
    <>
      <Track side="left" thumbRef={leftThumbRef} />
      <Track side="right" thumbRef={rightThumbRef} />
    </>
  );
}
