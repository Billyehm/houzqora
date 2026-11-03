'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/queries';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    try {
      await sendMessage(name.trim(), email.trim(), message.trim());
      setSent(true);
    } catch {
      setError('Your message could not be sent. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Contact</h1>
      <p className="mt-2 text-muted">Send a message about a home, a viewing, or a payment.</p>
      {sent ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6">Thanks, {name || 'friend'}. Your message was recorded. The agency team will get back to you.</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <label className="block text-xs font-extrabold text-velvet">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          {error && <p className="mt-3 text-sm font-bold text-strawberry">{error}</p>}
          <button onClick={submit} className="btn-press mt-4 rounded-full bg-strawberry px-5 py-3 font-bold text-white">Send message</button>
        </div>
      )}
    </div>
  );
}
