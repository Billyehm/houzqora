'use client';

/* Thumb refs are plain { current } holders so the component works with
 * the React version in this app, where RefObject nullability differs. */

/*
 * CardScrollbars: the identical subtle scrollbar pair used by every
 * animation card. One slim track flush with the left edge and one
 * flush with the right edge, each with a short rounded thumb. Both
 * thumbs are driven from the same source in the owning card: a single
 * GSAP timeline tween that moves both thumbs together, so the left
 * and right thumbs always sit at the same vertical position. The thumb
 * is 25 percent of the track height, so yPercent 300 moves it exactly
 * to the bottom of the track (travel is 75 percent of the track,
 * which is three times the thumb height). No timers, no scroll
 * listeners, no instructional text, no dot, no red colour. The whole
 * scrollbar is quiet light ash, just enough to show that more can be
 * scrolled downwards. Purely decorative, aria-hidden.
 */
type ThumbRef = { current: HTMLDivElement | null };

type CardScrollbarsProps = {
  leftThumbRef: ThumbRef;
  rightThumbRef: ThumbRef;
};

function Track({ side, thumbRef }: { side: 'left' | 'right'; thumbRef: ThumbRef }) {
  const position = side === 'left' ? 'left-0' : 'right-0';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-20 h-[72%] w-[4px] -translate-y-1/2 bg-[#e7e3df]/60 ${position}`}
    >
      <div
        ref={(el) => {
          thumbRef.current = el;
        }}
        className="absolute left-0 top-0 h-1/4 w-full bg-[#c4beb6]"
      />
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
