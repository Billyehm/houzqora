export default function HowItWorks() {
  const steps = [
    ['1', 'Browse properties', 'Explore available houses and compare prices, cities, and sizes.'],
    ['2', 'Choose a property', 'View the details, the inspection fee, and the amount needed to secure it.'],
    ['3', 'Confirm inspection', 'Confirm your inspection and the fee for arranging it.'],
    ['4', 'Arrange your inspection', 'Receive confirmation and instructions, pick a viewing slot in My homes, and decide after viewing.'],
  ];
  return (
    <div className="max-w-3xl">
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">How it works</h1>
      <p className="mt-2 text-muted">Four simple steps. Confirming an inspection does not automatically mean the property has been reserved or rented.</p>
      <div className="mt-6 space-y-4">
        {steps.map(([n, t, d]) => (
          <div key={t} className="rounded-2xl border border-line bg-white p-5">
            <p className="grid h-8 w-8 place-items-center rounded-full bg-strawberry text-sm font-extrabold text-white">{n}</p>
            <p className="mt-3 font-bold">{t}</p>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
