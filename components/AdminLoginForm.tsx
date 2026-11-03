'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/admin-auth';
import PasswordField from '@/components/PasswordField';

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    const result = await adminLogin(username, password);
    if (!result.ok) {
      setError(result.error || 'Login failed.');
      setBusy(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-white p-6">
      <h1 className="text-2xl font-extrabold text-velvet">Admin</h1>
      <p className="mt-2 text-sm text-muted">Sign in with the admin username and password from .env.local.</p>
      <label className="mt-4 block text-xs font-extrabold text-velvet">Username<input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
      <PasswordField value={password} onChange={setPassword} />
      {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
      <button onClick={submit} disabled={busy} className="btn-press mt-4 w-full rounded-full bg-velvet px-5 py-3 font-bold text-white disabled:opacity-60">Log in</button>
    </div>
  );
}
