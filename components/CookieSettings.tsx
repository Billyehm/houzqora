'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_COOKIE_PREFS, loadCookiePrefs, saveCookiePrefs, type CookiePrefs } from '@/lib/cookie-prefs';
import Spinner from '@/components/Spinner';

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange?: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`btn-press relative h-8 w-14 shrink-0 rounded-full ${checked ? 'bg-strawberry' : 'bg-line'} ${disabled ? 'opacity-60' : ''}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export default function CookieSettings() {
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_COOKIE_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(loadCookiePrefs());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p className="mt-6 flex items-center gap-2"><Spinner />Loading your cookie choices...</p>;
  }

  const save = () => {
    setSaving(true);
    saveCookiePrefs(prefs);
    setSaved(true);
    setSaving(false);
  };

  const acceptAll = () => {
    const next: CookiePrefs = { preferences: true, analytics: false, marketing: false };
    setPrefs(next);
    saveCookiePrefs(next);
    setSaved(true);
  };

  const rejectOptional = () => {
    const next: CookiePrefs = { preferences: false, analytics: false, marketing: false };
    setPrefs(next);
    saveCookiePrefs(next);
    setSaved(true);
  };

  return (
    <div>
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-velvet">Strictly necessary</p>
              <p className="mt-1 text-sm text-muted">Sign in session and admin login. Needed for the site to work. Always on.</p>
            </div>
            <Toggle label="Strictly necessary cookies, always on" checked disabled />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-velvet">Preferences</p>
              <p className="mt-1 text-sm text-muted">Saved homes, bookings fallback, discount state, and the home you were looking at before signing up. Stored on your device.</p>
            </div>
            <Toggle label="Preference storage" checked={prefs.preferences} onChange={(next) => { setPrefs({ ...prefs, preferences: next }); setSaved(false); }} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-velvet">Analytics</p>
              <p className="mt-1 text-sm text-muted">Not used. HOUZQORA does not run analytics cookies. Turning this on changes nothing until we add analytics and update the Cookie Policy.</p>
            </div>
            <Toggle label="Analytics cookies" checked={prefs.analytics} onChange={(next) => { setPrefs({ ...prefs, analytics: next }); setSaved(false); }} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-velvet">Marketing</p>
              <p className="mt-1 text-sm text-muted">Not used. HOUZQORA does not run advertising cookies and does not track you across other sites.</p>
            </div>
            <Toggle label="Marketing cookies" checked={prefs.marketing} onChange={(next) => { setPrefs({ ...prefs, marketing: next }); setSaved(false); }} />
          </div>
        </div>
      </div>

      {saved && <p className="mt-4 rounded-2xl border border-line bg-white p-4 text-sm font-bold text-velvet">Your cookie choices have been saved on this device.</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={save} disabled={saving} className="btn-press flex items-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">{saving && <Spinner />}{saving ? 'Saving...' : 'Save choices'}</button>
        <button onClick={acceptAll} className="btn-press rounded-full border border-line bg-white px-5 py-3 font-bold text-velvet">Accept necessary and preferences</button>
        <button onClick={rejectOptional} className="btn-press rounded-full border border-line bg-white px-5 py-3 font-bold text-velvet">Reject optional</button>
      </div>

      <p className="mt-4 text-sm text-muted">Read the full detail in the <Link href="/cookie-policy" className="text-strawberry">Cookie Policy</Link>. You can also delete cookies and browser storage in your browser settings at any time.</p>
    </div>
  );
}
