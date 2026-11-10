'use server';

import { getAdminSupabase } from './admin-supabase';

// Signup check: one email, one account.
//
// Supabase signUp alone does not stop a second signup with the
// same email in every case: an account that signed up but never
// confirmed gets a fresh confirmation email instead of an error,
// so the visitor sees "Check your email" again and believes a
// second account was made. William asked for the opposite: the
// signup must fail here with a clear message and a way to log in.
//
// This runs on the server only, with the service role key, so the
// key never reaches the browser. It lists auth users server side
// and looks for this email. Same scan as lib/reset-password.ts,
// kept separate so the working reset flow is untouched.
//
// Trade off, same as the reset check: this tells anyone who tries
// an email whether that email has a HOUZQORA account. That is the
// point of the change.

export async function checkEmailTaken(
  rawEmail: string,
): Promise<{ taken: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!email.includes('@')) {
    return { taken: false, error: 'Please enter a valid email.' };
  }

  let supabase;
  try {
    supabase = getAdminSupabase();
  } catch {
    return { taken: false, error: 'Email check is not set up yet.' };
  }

  try {
    // listUsers has no email filter in this version of supabase-js,
    // so scan pages server side and return only a yes or no. The
    // list itself never leaves the server. Ten pages of 1000 covers
    // far more accounts than the site has today.
    let found = false;
    for (let page = 1; page <= 10 && !found; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const users = data?.users || [];
      if (users.some((u) => (u.email || '').toLowerCase() === email)) found = true;
      if (users.length < 1000) break;
    }
    return { taken: found };
  } catch (e) {
    return { taken: false, error: e instanceof Error ? e.message : 'Something went wrong. Please try again.' };
  }
}
