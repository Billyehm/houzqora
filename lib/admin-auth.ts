'use server';

import { createHmac } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'houzqora_admin';

function adminCookieValue() {
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password) return '';
  return createHmac('sha256', password).update('houzqora-admin').digest('hex');
}

export async function isAdmin() {
  const expected = adminCookieValue();
  if (!expected) return false;
  return cookies().get(COOKIE)?.value === expected;
}

export async function adminLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const expectedUser = process.env.ADMIN_USERNAME || '';
  const expectedPass = process.env.ADMIN_PASSWORD || '';
  if (!expectedUser || !expectedPass) {
    return { ok: false, error: 'Admin login is not set up yet. Fill in ADMIN_USERNAME and ADMIN_PASSWORD in .env.local, then restart the app.' };
  }
  if (username !== expectedUser || password !== expectedPass) {
    return { ok: false, error: 'Wrong username or password.' };
  }
  cookies().set(COOKIE, adminCookieValue(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  return { ok: true };
}

export async function adminLogout() {
  cookies().set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
