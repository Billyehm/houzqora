'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import { getCurrentUser, type AppUser } from '@/lib/queries';

export default function Header() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Re-check on every navigation, because the header lives in the
  // layout and does not remount when login redirects to Dashboard
  // or when logout redirects home. Without this, it would keep
  // showing the buttons from the page it first loaded on.
  useEffect(() => {
    getCurrentUser().then(setUser);
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setUser(null); return; }
      getCurrentUser().then(setUser);
    });
    return () => data.subscription.unsubscribe();
  }, [pathname]);

  const logOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setLoggingOut(false);
    }
    router.push('/');
  };

  // The admin page has its own env login and its own Log out button
  // in the panel, and this header only knows the Supabase user, not
  // the admin cookie. So on /admin it would always show Log in and
  // Sign up, even to a logged-in admin. Hide the header buttons there.
  const isAdminPage = pathname === '/admin';

  // On login and signup the form is a narrow centred column, so the
  // header narrows to that same column instead of stretching wide.
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Log out lives only on Dashboard. On every other page a logged
  // in user sees just the logo in the header, with no Log out
  // button, so Dashboard is the one place to sign out from.

  return (
    <header className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      {!isAdminPage && (
      <nav className="flex flex-wrap items-center gap-3">
        {user ? (
          pathname === '/dashboard' ? (
            <button type="button" onClick={logOut} disabled={loggingOut} className="btn-press flex items-center gap-2 rounded-full bg-velvet px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)] disabled:opacity-60">{loggingOut && <Spinner className="h-3.5 w-3.5" />}Log out</button>
          ) : null
        ) : (
          <>
            <Link href="/login" className="btn-press rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-velvet shadow-sm">Log in</Link>
            <Link href="/signup" className="btn-press rounded-full bg-strawberry px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Sign up</Link>
          </>
        )}
      </nav>
      )}
    </header>
  );
}
