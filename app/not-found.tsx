import Link from 'next/link';

// Next.js renders this page for any unknown route, and for any
// page that calls notFound(). It has to be instantly recognisable:
// a huge 404, a house with no door home, one plain sentence about
// what happened, and two clear buttons for what to do next.
export default function NotFound() {
  return (
    <div className="mx-auto mt-10 max-w-md text-center sm:mt-16">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 100"
        className="mx-auto h-24 w-28"
      >
        <path d="M10 52 L60 12 L110 52" fill="none" stroke="#5E1220" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="22" y="50" width="76" height="42" rx="6" fill="#ffffff" stroke="#5E1220" strokeWidth="4" />
        <rect x="52" y="66" width="16" height="26" rx="3" fill="#E63B4E" />
        <circle cx="60" cy="38" r="14" fill="#E63B4E" />
        <text x="60" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff">?</text>
      </svg>

      <p className="mt-6 text-8xl font-extrabold leading-none tracking-tight text-velvet sm:text-9xl">
        4<span className="text-strawberry">0</span>4
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Page not found</h1>
      <p className="mx-auto mt-3 max-w-sm text-muted">
        This page does not exist or was moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-press rounded-full bg-strawberry px-6 py-3 font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">
          Go home
        </Link>
        <Link href="/contact" className="btn-press rounded-full border border-line bg-white px-6 py-3 font-bold text-velvet">
          Contact us
        </Link>
      </div>

      <p className="mt-8 text-sm font-bold text-strawberry">HOUZQORA · Verified rentals in the Netherlands</p>
    </div>
  );
}
