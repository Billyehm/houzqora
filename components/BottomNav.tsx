'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/bookings',
    label: 'Bookings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/transportation',
    label: 'Transportation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12l20-8-6 16-4-7-10-1z" />
      </svg>
    ),
  },
  {
    href: '/saved',
    label: 'Saved',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.5 0 3 .8 4.3 2.3C13.3 5.3 14.8 4.5 16.3 4.5 18.8 4.5 21 6.4 21 9.3c0 4-4 7.2-9 11.2z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-4 gap-1 rounded-full border border-white/10 bg-velvetdark px-2 py-2 shadow-[0_18px_40px_rgba(61,11,20,0.45)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`btn-press flex flex-col items-center gap-1 rounded-full py-2.5 text-xs font-extrabold ${
                active ? 'bg-strawberry text-white shadow-[0_2px_0_rgba(94,18,32,0.3)]' : 'text-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
