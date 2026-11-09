'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clearPendingPath, clearPendingSlug, ensureProfile, fetchBookings, getCurrentUser, getPendingPath, getPendingSlug, upsertBooking } from '@/lib/queries';
import PasswordField from '@/components/PasswordField';
import Spinner from '@/components/Spinner';
import CountryCodePicker, { COUNTRY_CODES, type CountryCode } from '@/components/CountryCodePicker';

export default function AuthForm({ mode, initialEmail }: { mode: 'signup' | 'login'; initialEmail?: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password needs at least 6 characters.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your full name.'); return; }
    setBusy(true);
    try {
      // Full international number: the constant +code from the
      // picker plus the local digits as typed. If the user typed
      // the code in the box too, it is stripped once so it is not
      // doubled. The phone box stays empty when no number is given.
      // On login this stays empty, so the saved account phone wins.
      const digits = mode === 'signup' ? phone.replace(/[\s-]/g, '').replace(/^\+/, '') : '';
      const fullPhone = !digits
        ? ''
        : digits.startsWith(country.code)
          ? `+${digits}`
          : `+${country.code} ${digits}`;
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          // After confirming, Supabase sends the user straight to
          // /login, with only the email address in the link, so the
          // login box is already filled. The password is never put
          // in a link: only the user knows it, and a link lives in
          // browser history and in the email itself.
          options: {
            data: { name: name.trim(), phone: fullPhone },
            emailRedirectTo: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setShowConfirmPopup(true);
          setBusy(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      const user = await getCurrentUser();
      // On login there is no phone field, so phone is empty here.
      // Fall back to the phone on the account, which signup stored
      // in the account metadata, so a first login after email
      // confirmation still saves the signup phone instead of losing it.
      if (user) await ensureProfile(user, fullPhone || user.phone || '');
      // A pending page wins over a pending home: it is the page the
      // visitor was trying to reach before logging in, such as the
      // agents page after tapping Contact agent while logged out.
      const pendingPath = getPendingPath();
      if (pendingPath && user) {
        clearPendingPath();
        clearPendingSlug();
        router.push(pendingPath);
        return;
      }
      const pending = getPendingSlug();
      if (pending && user) {
        const bookings = await fetchBookings(user.id);
        await upsertBooking(user.id, pending, bookings[pending] || { paid: false, slot: '' });
        clearPendingSlug();
      }
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
    <div className="rounded-2xl border border-line bg-white p-6">
      {mode === 'signup' && (
        <>
          <label className="mt-4 block text-xs font-extrabold text-velvet">Full name<input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} placeholder="e.g. Anna de Vries" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <span className="mt-3 block text-xs font-extrabold text-velvet">Phone
            <span className="mt-1 flex items-stretch gap-2">
              <CountryCodePicker country={country} onChange={setCountry} disabled={busy} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} placeholder="6 00 00 00 00" className="block w-full min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none" />
            </span>
          </span>
        </>
      )}
      <label className="mt-3 block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} placeholder="you@example.com" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      <PasswordField value={password} onChange={setPassword} placeholder="At least 6 characters" disabled={busy} />
      {mode === 'login' && (
        <p className="mt-2 text-right text-sm">
          <a href="/forgot-password" className="font-bold text-velvet">Forgot password?</a>
        </p>
      )}
      {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
      <button onClick={submit} disabled={busy} className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
        {busy && <Spinner />}
        {mode === 'signup' ? 'Create account and continue' : 'Log in and continue'}
      </button>
      <p className="mt-3 text-center text-sm text-muted">
        {mode === 'signup' ? (<>Already have an account? <a href="/login" className="font-bold text-velvet">Log in</a></>) : (<>New here? <a href="/signup" className="font-bold text-velvet">Sign up</a></>)}
      </p>
    </div>
    {showConfirmPopup && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowConfirmPopup(false)}>
        <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]" onClick={(e) => e.stopPropagation()}>
          <button aria-label="Close" onClick={() => setShowConfirmPopup(false)} className="btn-press absolute right-4 top-4 rounded-full bg-cream px-3 py-1 font-extrabold text-velvet">×</button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-velvet text-white">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-velvet">Check your email</h2>
          <p className="mt-2 text-sm text-muted">Check your email to confirm your account, then log in.</p>
          <button onClick={() => { setShowConfirmPopup(false); router.push('/login'); }} className="btn-press mt-5 w-full rounded-full border border-velvet px-5 py-3 font-bold text-velvet">Log in</button>
        </div>
      </div>
    )}
    </>
  );
}
