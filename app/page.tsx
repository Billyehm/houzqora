import FilterGrid from '@/components/FilterGrid';
import CameraZoom from '@/components/scroll/CameraZoom';
import WindowReveal from '@/components/scroll/WindowReveal';
import GlassDoorReveal from '@/components/scroll/GlassDoorReveal';
import BlueprintReveal from '@/components/scroll/BlueprintReveal';
import { properties } from '@/lib/properties';

export default function Home() {
  return (
    <div>
      <CameraZoom />

      <section className="pt-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-strawberry">Netherlands rentals · Amsterdam · Rotterdam · Utrecht</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-velvet sm:text-5xl">
          Find a place you will be <span className="text-strawberry">proud</span> to call home.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Explore verified rental homes, pay the inspection fee securely online in the real build, and get clear next steps by email.
          No hidden charges. Paying the fee does not reserve the home.
        </p>
        <p className="mt-4 text-sm text-muted">Verified listings · Clear fees · Inspection first, decision second</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-velvet">Featured homes</h2>
        <p className="mt-1 text-muted">Search by city and bedrooms. Tap a home to see its inspection fee and securing amount.</p>
        <div className="mt-4"><FilterGrid properties={properties} /></div>
      </section>

      <BlueprintReveal />

      <section className="py-12 text-center">
        <h2 className="mx-auto max-w-xl text-2xl font-extrabold text-velvet">Open the door, in your own time.</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">Scroll at your pace. Every reveal above is tied to your scroll, so you can stop, go back, and look again.</p>
      </section>

      <WindowReveal />

      <section className="py-12 text-center">
        <h2 className="mx-auto max-w-xl text-2xl font-extrabold text-velvet">Homes that feel finished, not just listed.</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">Clear rent in euros per month, a clear inspection fee, and a clear amount to secure the home.</p>
      </section>

      <GlassDoorReveal />

      <section className="mt-12">
        <h2 className="text-2xl font-extrabold text-velvet">How it works</h2>
        <div className="mt-3 border-t-[3px] border-dotted border-strawberry/70" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['1', 'Browse homes', 'Compare real homes, prices, and neighbourhoods.'],
            ['2', 'Sign up to book', 'Create your account only when you are ready to book.'],
            ['3', 'Pay inspection fee', 'Pay securely online. You get email confirmation in the real build.'],
            ['4', 'Arrange your viewing', 'Pick a slot. After login, you see only your homes, no adverts.'],
          ].map(([n, t, d]) => (
            <div key={t} className="rounded-2xl border border-line bg-white p-4">
              <p className="grid h-8 w-8 place-items-center rounded-full bg-strawberry text-sm font-extrabold text-white">{n}</p>
              <p className="mt-3 font-bold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-2xl font-extrabold text-velvet">Trust and transparency</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="font-bold">What the fee covers</p><p className="mt-1 text-sm text-muted">Arranging and conducting your viewing, plus confirmation by email in the real build.</p></div>
          <div><p className="font-bold">What it does not do</p><p className="mt-1 text-sm text-muted">It does not reserve, allocate, or guarantee the home. The home stays available until the securing payment is confirmed.</p></div>
          <div><p className="font-bold">What happens next</p><p className="mt-1 text-sm text-muted">After payment, you pick a viewing slot in My homes, view the home, then decide.</p></div>
        </div>
      </section>
    </div>
  );
}
