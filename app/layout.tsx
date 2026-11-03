import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'HOUZQORA | Verified rentals in the Netherlands',
  description: 'Explore verified rental homes in the Netherlands, pay the inspection fee, and arrange your viewing with clear next steps.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dots-bg min-h-screen font-sans">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">{children}</main>
        <Footer />
        <div aria-hidden="true" className="h-24" />
        <BottomNav />
      </body>
    </html>
  );
}
