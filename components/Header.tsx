'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearDemoUser, getDemoUser, type DemoUser } from '@/lib/demo';

export default function Header() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Re-check on every navigation, because the header lives in the
  // layout and does not remount when login redirects to Dashboard
  // or when logout redirects home. Without this, it would keep
  // showing the buttons from the page it first loaded on.
  useEffect(() => {
    setUser(getDemoUser());
  }, [pathname]);

  const logOut = () => {
    clearDemoUser();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-3">
        {user ? (
          <button type="button" onClick={logOut} className="btn-press rounded-full bg-velvet px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Log out</button>
        ) : (
          <>
            <Link href="/login" className="btn-press rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-velvet shadow-sm">Log in</Link>
            <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
