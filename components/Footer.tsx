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
      <div className="rounded-2xl bg-velvetdark p-5 text-white sm:p-8">
        <p className="font-extrabold tracking-[0.12em]">HOUZQORA</p>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Verified rentals in the Netherlands. Clear fees, honest next steps.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-bold text-white">Platform</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/80">
              <Link href="/how-it-works">How it works</Link>
              <Link href="/about">About</Link>
              <Link href="/agents">Chat with an agent</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Contact</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/80">
              <Link href="/contact">Contact us</Link>
              <Link href="/contact">Help and privacy requests</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Legal</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/80">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms and conditions</Link>
              <Link href="/inspection-policy">Inspection policy</Link>
              <Link href="/cookie-policy">Cookie Policy</Link>
              <Link href="/cookie-settings">Cookie settings</Link>
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-xl text-sm text-white/70">
          HOUZQORA is a rental and property inspection platform for the Netherlands, for people finding their next home and arranging a viewing with clear fees.
        </p>
        <p className="mt-4 max-w-xl text-sm text-white/70">
          HOUZQORA is the brand of [COMPANY LEGAL NAME], registered in the Netherlands, [COMPANY REGISTRATION NUMBER].
        </p>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-sm text-white/70">© 2026 HOUZQORA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
