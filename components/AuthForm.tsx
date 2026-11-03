'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clearPendingSlug, ensureProfile, fetchBookings, getCurrentUser, getPendingSlug, upsertBooking } from '@/lib/queries';

export default function AuthForm({ mode }: { mode: 'signup' | 'login' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setNotice('');
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password needs at least 6 characters.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your full name.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim(), phone } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('Check your email to confirm your account, then log in.');
          setBusy(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      const user = await getCurrentUser();
      if (user) await ensureProfile(user, phone);
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
    <div className="rounded-2xl border border-line bg-white p-6">
      {notice && <p className="rounded-xl bg-cream p-3 text-sm font-bold text-velvet">{notice}</p>}
      {mode === 'signup' && (
        <>
          <label className="mt-4 block text-xs font-extrabold text-velvet">Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anna de Vries" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+31 6 00 00 00 00" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
        </>
      )}
      <label className="mt-3 block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      <label className="mt-3 block text-xs font-extrabold text-velvet">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
      <button onClick={submit} disabled={busy} className="btn-press mt-4 w-full rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
        {mode === 'signup' ? 'Create account and continue' : 'Log in and continue'}
      </button>
      <p className="mt-3 text-center text-sm text-muted">
        {mode === 'signup' ? (<>Already have an account? <a href="/login" className="font-bold text-velvet">Log in</a></>) : (<>New here? <a href="/signup" className="font-bold text-velvet">Sign up</a></>)}
      </p>
    </div>
  );
}
