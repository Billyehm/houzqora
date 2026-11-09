import Link from 'next/link';
import CookieSettings from '@/components/CookieSettings';

export default function CookieSettingsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Cookie settings</h1>
      <p className="mt-3 text-muted">Choose what HOUZQORA can store on this device. Your choices are saved on this device only.</p>
      <CookieSettings />
      <div className="mt-8 rounded-2xl border border-line bg-white p-5">
        <p className="font-bold text-velvet">More legal pages</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy-policy" className="text-strawberry">Privacy Policy</Link>
          <Link href="/terms" className="text-strawberry">Terms and conditions</Link>
          <Link href="/inspection-policy" className="text-strawberry">Inspection policy</Link>
          <Link href="/cookie-policy" className="text-strawberry">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
