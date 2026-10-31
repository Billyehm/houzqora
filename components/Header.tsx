import Link from 'next/link';

export default function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm text-muted">
        <Link href="/properties">Properties</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/login" className="font-semibold text-velvet">Log in</Link>
        <Link href="/dashboard" className="font-semibold text-velvet">Dashboard</Link>
        <Link href="/bookings" className="font-semibold text-velvet">Bookings</Link>
      </nav>
      <Link href="/properties" className="btn-press rounded-full bg-velvet px-4 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">
        Browse properties
      </Link>
    </header>
  );
}
