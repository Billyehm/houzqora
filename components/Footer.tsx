'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  // On login and signup the form is a narrow centred column, so the
  // footer narrows to that same column instead of stretching wide.
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  return (
    <footer className={`mx-auto px-4 pb-10 sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
      <div className="rounded-2xl bg-velvetdark p-5 text-white">
        <p className="font-extrabold tracking-[0.12em]">HOUZQORA</p>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Verified rentals in the Netherlands. Clear fees, honest next steps.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/inspection-policy">Inspection policy</Link>
        </div>
      </div>
    </footer>
  );
}
