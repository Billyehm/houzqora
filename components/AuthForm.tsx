'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMyHome, clearPendingSlug, getPendingSlug, setDemoUser } from '@/lib/demo';

export default function AuthForm({ mode }: { mode: 'signup' | 'login' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 6) { setError('Password needs at least 6 characters.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your full name.'); return; }
    setDemoUser({ name: name.trim() || 'Welcome', email });
    const pending = getPendingSlug();
    if (pending) { addMyHome(pending); clearPendingSlug(); }
    router.push('/browse');
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <p className="rounded-xl bg-cream p-3 text-sm text-muted">
        Demo account only in this stage. No real account is created yet, and no real email is sent.
      </p>
      {mode === 'signup' && (
        <>
          <label className="mt-4 block text-xs font-extrabold text-velvet">Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anna de Vries" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+31 6 00 00 00 00" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
        </>
      )}
      <label className="mt-3 block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      <label className="mt-3 block text-xs font-extrabold text-velvet">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
      <button onClick={submit} className="btn-press mt-4 w-full rounded-full bg-strawberry px-5 py-3 font-bold text-white">
        {mode === 'signup' ? 'Create account and continue' : 'Log in and continue'}
      </button>
      <p className="mt-3 text-center text-sm text-muted">
        {mode === 'signup' ? (<>Already have an account? <a href="/login" className="font-bold text-velvet">Log in</a></>) : (<>New here? <a href="/signup" className="font-bold text-velvet">Sign up</a></>)}
      </p>
    </div>
  );
}
