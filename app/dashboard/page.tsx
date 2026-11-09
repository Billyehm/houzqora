import DashboardClient from '@/components/DashboardClient';

export default function DashboardPage({ searchParams }: { searchParams?: { page?: string } }) {
  // The list opens on the page in the address, so a shared link
  // or the back button lands on the right page from the start.
  const raw = Number(searchParams?.page ?? '1');
  const initialPage = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  return <DashboardClient initialPage={initialPage} />;
}
