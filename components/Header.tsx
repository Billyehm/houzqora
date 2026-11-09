'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import { getCurrentUser, type AppUser } from '@/lib/queries';

export default function Header() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Close the landing menu when the page changes, when the visitor
  // taps outside it, or when Escape is pressed.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

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
  // The landing menu follows the same rule: it links to Dashboard,
  // Bookings, Saved, and Travel, but it never shows Log out.
  const isLanding = pathname === '/';

  const jumpLinks = [
    { href: '/#featured-homes', label: 'Featured homes' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#trust', label: 'Trust and transparency' },
  ];

  return (
    <header className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      {!isAdminPage && (
      <nav className="relative flex flex-wrap items-center gap-3">
        {isLanding ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="btn-press grid h-11 w-11 place-items-center rounded-full border border-line bg-white shadow-sm"
            >
              <span className="flex flex-col items-center gap-1.5">
                <span className={`block h-0.5 w-5 rounded bg-velvet transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`block h-0.5 w-5 rounded bg-velvet transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 rounded bg-velvet transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-3 shadow-[0_16px_40px_rgba(94,18,32,0.18)]">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-press block rounded-full bg-strawberry px-5 py-3 text-center text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-press block rounded-full bg-strawberry px-5 py-3 text-center text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Sign up</Link>
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-press mt-2 block rounded-full border border-line bg-white px-5 py-3 text-center text-sm font-bold text-velvet shadow-sm">Log in</Link>
                  </>
                )}
                {user && (
                  <>
                    <div className="mt-3 border-t border-line" />
                    <Link href="/bookings" onClick={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">Bookings</Link>
                    <Link href="/saved" onClick={() => setMenuOpen(false)} className="btn-press block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">Saved</Link>
                    <Link href="/transportation" onClick={() => setMenuOpen(false)} className="btn-press block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">Travel</Link>
                  </>
                )}
                <div className="mt-3 border-t border-line" />
                <p className="px-3 pt-3 text-xs font-extrabold uppercase tracking-wide text-muted">On this page</p>
                {jumpLinks.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">{l.label}</Link>
                ))}
                <div className="mt-3 border-t border-line" />
                <Link href="/about" onClick={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">About</Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="btn-press block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">Contact</Link>
                <Link href="/agents" onClick={() => setMenuOpen(false)} className="btn-press block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">Chat with an agent</Link>
              </div>
            )}
          </div>
        ) : user ? (
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
