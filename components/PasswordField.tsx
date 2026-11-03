'use client';

import { useState } from 'react';

// Password input with a peek toggle, so a user can check what they
// typed before submitting. Used by the login, signup and admin
// login forms, so the toggle looks and behaves the same everywhere.
export default function PasswordField({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="mt-3 block text-xs font-extrabold text-velvet">
      Password
      <span className="relative mt-1 block">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full rounded-xl border border-line px-3 py-2.5 pr-11 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="btn-press absolute inset-y-0 right-0 flex items-center px-3 text-velvet"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
            {!show && <line x1="2" y1="2" x2="22" y2="22" />}
          </svg>
        </button>
      </span>
    </label>
  );
}
