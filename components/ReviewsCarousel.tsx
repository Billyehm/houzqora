'use client';

import { useEffect, useState } from 'react';

type Review = {
  name: string;
  place: string;
  stars: number;
  rating: number;
  text: string;
};

// Sample reviews. Replace these with real customer reviews when ready.
const REVIEWS: Review[] = [
  {
    name: 'Sanne K.',
    place: 'Amsterdam',
    stars: 5,
    rating: 4.9,
    text: 'The inspection report was so detailed I signed the lease the same day. Worth every euro.',
  },
  {
    name: 'Amara O.',
    place: 'Rotterdam',
    stars: 5,
    rating: 4.8,
    text: 'I rented from abroad and the video walkthrough showed everything, even the small damp patch in the bathroom.',
  },
  {
    name: 'Jeroen V.',
    place: 'Utrecht',
    stars: 5,
    rating: 4.7,
    text: 'Booked on Monday, inspected on Wednesday, moved in on Friday. Fast and honest.',
  },
  {
    name: 'Fatima E.',
    place: 'The Hague',
    stars: 5,
    rating: 4.6,
    text: 'The inspector found a broken boiler the photos never showed. That alone paid for the fee.',
  },
  {
    name: 'Lars B.',
    place: 'Amsterdam',
    stars: 4,
    rating: 4.2,
    text: 'Clear report, clear photos, no surprises when I got the keys.',
  },
  {
    name: 'Chiara M.',
    place: 'Eindhoven',
    stars: 5,
    rating: 4.5,
    text: 'They replied in minutes and moved my inspection without any fuss.',
  },
  {
    name: 'Daniel K.',
    place: 'Groningen',
    stars: 5,
    rating: 4.9,
    text: 'As an expat I had no idea what to check. The report explained everything in plain English.',
  },
];

function Stars({ value, className = 'text-sm' }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'text-[#E8A317]' : 'text-[#D8CFCB]'}>
          ★
        </span>
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .replace('.', '')
    .slice(0, 2)
    .toUpperCase();
}

function ReviewModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-velvet/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add a review"
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {saved ? (
          <div className="py-2 text-center sm:py-4">
            <p className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-velvet text-xl text-white sm:h-14 sm:w-14 sm:text-2xl">
              ✓
            </p>
            <p className="mt-3 text-lg font-extrabold text-velvet sm:mt-4 sm:text-xl">Saved</p>
            <p className="mt-1 text-sm text-muted">Thank you for sharing your experience.</p>
            <button
              type="button"
              onClick={onClose}
              className="btn-press mt-4 rounded-full bg-strawberry px-6 py-2.5 font-bold text-white sm:mt-5"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-extrabold text-velvet sm:text-xl">Add a review</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="btn-press grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-lg leading-none text-muted"
              >
                ×
              </button>
            </div>
            <label className="mt-3 block text-sm font-bold text-velvet sm:mt-5" htmlFor="review-name">
              Your name
            </label>
            <input
              id="review-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sanne K."
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-strawberry sm:py-2.5"
            />
            <p className="mt-3 text-sm font-bold text-velvet sm:mt-4">Your rating</p>
            <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setRating(n)}
                  className={`btn-press p-1 text-2xl leading-none sm:text-3xl ${
                    n <= rating ? 'text-[#E8A317]' : 'text-[#D8CFCB]'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="mt-3 block text-sm font-bold text-velvet sm:mt-4" htmlFor="review-text">
              Your review
            </label>
            <textarea
              id="review-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was your inspection?"
              className="mt-1 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-strawberry sm:py-2.5"
            />
            <div className="mt-4 flex gap-3 sm:mt-5">
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="btn-press flex-1 rounded-full bg-strawberry px-5 py-2.5 font-bold text-white sm:py-3"
              >
                Save review
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-press rounded-full border border-line px-5 py-2.5 font-bold text-velvet sm:py-3"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReviewsCarousel() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_18px_50px_rgba(94,18,32,0.10)] backdrop-blur-md md:h-[176px] md:flex-row md:rounded-full">
        <div className="flex shrink-0 flex-col items-start justify-center gap-1.5 bg-velvet px-5 py-3 text-white md:w-[22%] md:min-w-[188px] md:px-6 md:py-0 lg:w-[20%]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70">
            Customer reviews
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-press mt-1 rounded-full bg-strawberry px-5 py-2.5 text-sm font-bold text-white"
          >
            Add review
          </button>
        </div>
        <div className="reviews-marquee reviews-fade relative flex flex-1 items-center overflow-hidden py-3 md:py-0">
          <div className="reviews-track flex w-max items-center">
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <article
                key={`${review.name}-${i}`}
                aria-hidden={i >= REVIEWS.length}
                className="mr-4 w-[300px] shrink-0 rounded-2xl border border-line bg-white/80 p-3 shadow-sm sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-velvet text-xs font-extrabold text-white">
                    {initials(review.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-velvet">{review.name}</span>
                    <span className="block text-xs text-muted">{review.place}</span>
                  </span>
                  <span className="ml-auto flex shrink-0 flex-col items-end">
                    <span className="text-sm font-extrabold leading-none text-velvet">
                      {review.rating.toFixed(1)}
                    </span>
                    <Stars value={review.stars} className="mt-0.5 text-xs" />
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-snug text-ink/90">{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      {open && <ReviewModal onClose={() => setOpen(false)} />}
    </div>
  );
}
