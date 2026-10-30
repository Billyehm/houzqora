'use client';

import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  return (
    <div className="max-w-2xl">
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">Contact</h1>
      <p className="mt-2 text-muted">Send a message about a home, a viewing, or a payment. In this stage, this form does not send a real email yet. It only shows a local confirmation.</p>
      {sent ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6">Thanks, {name || 'friend'}. Your message was recorded in this demo only. In the real build, it will be sent to the agency team.</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <label className="block text-xs font-extrabold text-velvet">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Email<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <label className="mt-3 block text-xs font-extrabold text-velvet">Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 block w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none" /></label>
          <button onClick={() => setSent(true)} className="btn-press mt-4 rounded-full bg-strawberry px-5 py-3 font-bold text-white">Send message</button>
        </div>
      )}
    </div>
  );
}
