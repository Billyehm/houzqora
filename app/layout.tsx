import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'HOUZQORA | Verified rentals in the Netherlands',
  description: 'Explore verified rental homes in the Netherlands, pay the inspection fee, and arrange your viewing with clear next steps.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dots-bg min-h-screen font-sans">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
