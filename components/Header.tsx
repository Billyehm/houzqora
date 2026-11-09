'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import AgentLink from './AgentLink';
import { getCurrentUser, type AppUser } from '@/lib/queries';

type MenuLink = { href: string; label: string };

// The menu changes with the page it is opened on. Each page gets
// the links that belong to that page, so the menu always shows
// what the visitor can do from where they are standing.
function pageSection(pathname: string): { title: string; links: MenuLink[] } {
  if (pathname === '/') {
    return {
      title: 'On this page',
      links: [
        { href: '/#featured-homes', label: 'Featured homes' },
        { href: '/#how-it-works', label: 'How it works' },
        { href: '/#trust', label: 'Trust and transparency' },
      ],
    };
  }
  if (pathname === '/dashboard') {
    return {
      title: 'Your homes',
      links: [
        { href: '/bookings', label: 'Bookings' },
        { href: '/saved', label: 'Saved' },
        { href: '/transportation', label: 'Travel' },
      ],
    };
  }
  if (pathname === '/bookings') {
    return {
      title: 'Your homes',
      links: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/saved', label: 'Saved' },
        { href: '/transportation', label: 'Travel' },
      ],
    };
  }
  if (pathname === '/saved') {
    return {
      title: 'Your homes',
      links: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/bookings', label: 'Bookings' },
        { href: '/transportation', label: 'Travel' },
      ],
    };
  }
  if (pathname === '/transportation') {
    return {
      title: 'Your homes',
      links: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/bookings', label: 'Bookings' },
        { href: '/saved', label: 'Saved' },
      ],
    };
  }
  if (pathname.startsWith('/properties/')) {
    const slug = pathname.split('/')[2] || '';
    return {
      title: 'This home',
      links: [
        { href: `/checkout/${slug}`, label: 'Book inspection' },
        { href: `/agents?slug=${encodeURIComponent(slug)}`, label: 'Contact agent' },
        { href: '/dashboard', label: 'Dashboard' },
      ],
    };
  }
  if (pathname.startsWith('/checkout/')) {
    const slug = pathname.split('/')[2] || '';
    return {
      title: 'This booking',
      links: [
        { href: `/properties/${slug}`, label: 'View home' },
        { href: '/bookings', label: 'Bookings' },
        { href: '/dashboard', label: 'Dashboard' },
      ],
    };
  }
  if (pathname === '/agents') {
    return {
      title: 'Agents',
      links: [
        { href: '/', label: 'Back to home' },
        { href: '/how-it-works', label: 'How it works' },
      ],
    };
  }
  if (pathname === '/login') {
    return {
      title: 'Account',
      links: [
        { href: '/signup', label: 'Sign up' },
        { href: '/forgot-password', label: 'Forgot password' },
      ],
    };
  }
  if (pathname === '/signup') {
    return {
      title: 'Account',
      links: [
        { href: '/login', label: 'Log in' },
        { href: '/forgot-password', label: 'Forgot password' },
      ],
    };
  }
  if (pathname === '/forgot-password' || pathname === '/reset-password') {
    return {
      title: 'Account',
      links: [
        { href: '/login', label: 'Log in' },
        { href: '/signup', label: 'Sign up' },
      ],
    };
  }
  if (pathname === '/about' || pathname === '/how-it-works') {
    return {
      title: 'Explore',
      links: [
        { href: '/#featured-homes', label: 'Featured homes' },
        { href: '/', label: 'Home' },
        { href: '/agents', label: 'Chat with an agent' },
      ],
    };
  }
  if (['/privacy-policy', '/terms', '/inspection-policy', '/cookie-policy', '/cookie-settings'].includes(pathname)) {
    return {
      title: 'Legal',
      links: [
        { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms and conditions' },
        { href: '/inspection-policy', label: 'Inspection policy' },
        { href: '/cookie-policy', label: 'Cookie Policy' },
        { href: '/cookie-settings', label: 'Cookie settings' },
      ],
    };
  }
  return {
    title: 'Explore',
    links: [
      { href: '/', label: 'Home' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/about', label: 'About' },
      { href: '/agents', label: 'Chat with an agent' },
    ],
  };
}

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

  // Close the menu when the page changes, when the visitor taps
  // outside it, or when Escape is pressed.
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
      setMenuOpen(false);
    }
    router.push('/');
  };

  // The admin page has its own env login and its own Log out button
  // in the panel, and this header only knows the Supabase user, not
  // the admin cookie. So on /admin the header shows only the logo,
  // with no hamburger, and the admin panel keeps its own Log out.
  const isAdminPage = pathname === '/admin';

  // On login and signup the form is a narrow centred column, so the
  // header narrows to that same column instead of stretching wide.
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Header buttons are gone everywhere. There is no Log in, Sign up,
  // or Log out pill in the header on any page. The hamburger holds
  // them instead: Sign up and Log in for visitors who are logged
  // out, and Log out at the bottom of the menu for visitors who
  // are logged in.
  const section = pageSection(pathname);
  const exploreLinks: MenuLink[] = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/about', label: 'About' },
    { href: '/agents', label: 'Chat with an agent' },
  ];
  const seen = new Set<string>([pathname, ...section.links.map((l) => l.href)]);
  if (user) seen.add('/dashboard');
  if (!user) {
    seen.add('/login');
    seen.add('/signup');
  }
  const explore = exploreLinks.filter((l) => !seen.has(l.href));
  const primary = user
    ? pathname === '/dashboard'
      ? { href: '/bookings', label: 'Bookings' }
      : { href: '/dashboard', label: 'Dashboard' }
    : null;

  return (
    <header className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 ${isAuthPage ? 'max-w-md' : 'max-w-6xl'}`}>
      <Link href="/" className="text-lg font-extrabold tracking-[0.12em] text-velvet">
        HOUZ<span className="text-strawberry">QORA</span>
      </Link>
      {!isAdminPage && (
      <nav className="relative flex flex-wrap items-center gap-3">
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
            <div className="absolute right-0 top-full z-50 mt-2 max-h-[80vh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-line bg-white p-3 shadow-[0_16px_40px_rgba(94,18,32,0.18)]">
              {user ? (
                primary && (
                  <Link href={primary.href} onClick={() => setMenuOpen(false)} className="btn-press block rounded-full bg-strawberry px-5 py-3 text-center text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">{primary.label}</Link>
                )
              ) : (
                <>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-press block rounded-full bg-strawberry px-5 py-3 text-center text-sm font-bold text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]">Sign up</Link>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-press mt-2 block rounded-full border border-line bg-white px-5 py-3 text-center text-sm font-bold text-velvet shadow-sm">Log in</Link>
                </>
              )}
              <div className="mt-3 border-t border-line" />
              <p className="px-3 pt-3 text-xs font-extrabold uppercase tracking-wide text-muted">{section.title}</p>
              {section.links.map((l) =>
                l.href.startsWith('/agents') ? (
                  <AgentLink key={l.href} href={l.href} onNavigate={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">{l.label}</AgentLink>
                ) : (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">{l.label}</Link>
                ),
              )}
              {explore.length > 0 && (
                <>
                  <div className="mt-3 border-t border-line" />
                  <p className="px-3 pt-3 text-xs font-extrabold uppercase tracking-wide text-muted">Explore</p>
                  {explore.map((l) =>
                    l.href.startsWith('/agents') ? (
                      <AgentLink key={l.href} href={l.href} onNavigate={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">{l.label}</AgentLink>
                    ) : (
                      <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="btn-press mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-velvet">{l.label}</Link>
                    ),
                  )}
                </>
              )}
              {user && (
                <>
                  <div className="mt-3 border-t border-line" />
                  <button type="button" onClick={logOut} disabled={loggingOut} className="btn-press mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-velvet px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                    {loggingOut && <Spinner className="h-3.5 w-3.5" />}Log out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      )}
    </header>
  );
}
