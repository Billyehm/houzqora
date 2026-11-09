'use client';

import { useState } from 'react';
import { requestPasswordReset } from '@/lib/reset-password';
import Spinner from '@/components/Spinner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setBusy(true);
    try {
      // The reset link lands on /reset-password, which is covered
      // by the /** wildcard already in the Supabase Redirect URLs,
      // so no dashboard change is needed for this flow. The server
      // action checks first if this email has an account. If it
      // does not, it returns an error and no link is sent.
      const result = await requestPasswordReset(email, `${window.location.origin}/reset-password`);
      if (!result.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md">
      <h1 className="text-3xl font-extrabold text-velvet">Forgot password</h1>
      <p className="mt-2 text-muted">Enter the email you signed up with, and we will send you a link to set a new password.</p>
      <div className="mt-5 rounded-2xl border border-line bg-white p-6">
        {sent ? (
          <>
            <p className="rounded-xl bg-cream p-3 text-sm font-bold text-velvet">Check your email for a password reset link.</p>
            <p className="mt-3 text-center text-sm text-muted">
              <a href="/login" className="font-bold text-velvet">Back to log in</a>
            </p>
          </>
        ) : (
          <>
            <label className="block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} placeholder="you@example.com" className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
            {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
            <button onClick={submit} disabled={busy} className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
              {busy && <Spinner />}
              Send reset link
            </button>
            <p className="mt-3 text-center text-sm text-muted">
              <a href="/login" className="font-bold text-velvet">Back to log in</a>
            </p>
            <p className="mt-3 text-center text-sm text-muted">
              No account yet? <a href="/signup" className="font-bold text-velvet">Sign up</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
