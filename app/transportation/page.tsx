import Link from 'next/link';

export default function TransportationPage() {
  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Travel</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-extrabold text-velvet">Flight</h2>
          <p className="mt-2"><span className="rounded-full bg-[#FFF0EF] px-3 py-1 text-xs font-extrabold text-velvet">COMING SOON</span></p>
        </section>
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-extrabold text-velvet">Cab</h2>
          <p className="mt-2"><span className="rounded-full bg-[#FFF0EF] px-3 py-1 text-xs font-extrabold text-velvet">COMING SOON</span></p>
        </section>
      </div>
      <Link href="/dashboard" className="btn-press mt-6 inline-block rounded-full bg-strawberry px-5 py-3 font-bold text-white">Dashboard</Link>
    </div>
  );
}
