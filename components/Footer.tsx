import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <div className="rounded-2xl bg-velvetdark p-5 text-white">
        <p className="font-extrabold tracking-[0.12em]">HOUZQORA</p>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Verified rentals in the Netherlands. Clear fees, honest next steps.
          Paying an inspection fee does not reserve a home.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/inspection-policy">Inspection policy</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
