'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PasswordField from '@/components/PasswordField';
import Spinner from '@/components/Spinner';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (password.length < 6) { setError('Password needs at least 6 characters.'); return; }
    setBusy(true);
    try {
      // The reset link from the email signs this browser in first,
      // so updateUser here sets the password for that account. If
      // the link is expired or was opened without it, this fails
      // and the user is pointed back to request a fresh link.
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md">
      <h1 className="text-3xl font-extrabold text-velvet">Set a new password</h1>
      <p className="mt-2 text-muted">Choose a new password for your account.</p>
      <div className="mt-5 rounded-2xl border border-line bg-white p-6">
        {done ? (
          <>
            <p className="rounded-xl bg-cream p-3 text-sm font-bold text-velvet">Your password is set. Log in with it now.</p>
            <button onClick={() => router.push('/login')} className="btn-press mt-4 w-full rounded-full bg-strawberry px-5 py-3 font-bold text-white">Log in</button>
          </>
        ) : (
          <>
            <PasswordField value={password} onChange={setPassword} placeholder="At least 6 characters" disabled={busy} />
            {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
            <button onClick={submit} disabled={busy} className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 py-3 font-bold text-white disabled:opacity-60">
              {busy && <Spinner />}
              Set new password
            </button>
            <p className="mt-3 text-center text-sm text-muted">
              Link expired? <a href="/forgot-password" className="font-bold text-velvet">Request a new one</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
