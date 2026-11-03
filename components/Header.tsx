import Link from 'next/link';

export default function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-3">
        <Link href="/login" className="btn-press rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-velvet shadow-sm">Log in</Link>
        <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Sign up</Link>
      </nav>
    </header>
  );
}
