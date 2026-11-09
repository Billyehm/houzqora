'use server';

import { getAdminSupabase } from './admin-supabase';

// Password reset, with an account check first.
//
// The old page called resetPasswordForEmail straight from the
// browser. Supabase then always answered success, even for an
// email with no account, so the visitor saw "Check your email"
// and nothing ever arrived. William asked for the opposite:
// if the email has no account, the reset must fail here and no
// link must be sent.
//
// This runs on the server only, with the service role key, so the
// key never reaches the browser. It lists auth users server side
// and looks for this email, then only calls resetPasswordForEmail
// when a matching account is found. That also covers accounts
// that signed up but have not confirmed or logged in yet, because
// they already have an auth user even though they have no profile
// row yet, so the profiles table alone would miss them.
//
// Trade off William asked for: this tells anyone who tries an
// email whether that email has a HOUZQORA account. That is the
// point of the change, and it is why the error names the missing
// account instead of pretending a link was sent.

export async function requestPasswordReset(
  rawEmail: string,
  redirectTo: string,
): Promise<{ ok: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!email.includes('@') || !email.includes('.')) {
    return { ok: false, error: 'Please enter a valid email.' };
  }
  if (!redirectTo.startsWith('http')) {
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }

  let supabase;
  try {
    supabase = getAdminSupabase();
  } catch {
    return { ok: false, error: 'Password reset is not set up yet. Please try again later.' };
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
    if (!found) {
      return { ok: false, error: 'No account with this email. Sign up first.' };
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) throw resetError;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong. Please try again.' };
  }
}
