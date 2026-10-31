// Demo session only. No real account, payment, or email is created here.
// Later stages will replace this with real auth, Mollie or Stripe with iDEAL
// verification, and Resend email.

export type DemoUser = { name: string; email: string };
export type MyHomeState = { paid: boolean; slot: string };

const USER_KEY = 'houzqora_demo_user';
const HOMES_KEY = 'houzqora_demo_homes';
const PENDING_KEY = 'houzqora_demo_pending';
const SAVED_KEY = 'houzqora_demo_saved';

export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = 'houzqora_demo=1; path=/; max-age=86400';
}

export function clearDemoUser() {
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(HOMES_KEY);
  window.localStorage.removeItem(PENDING_KEY);
  window.localStorage.removeItem(SAVED_KEY);
  document.cookie = 'houzqora_demo=; path=/; max-age=0';
}

export function getSavedSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Returns true when the home is saved after the toggle.
export function toggleSavedSlug(slug: string): boolean {
  const saved = getSavedSlugs();
  const next = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(slug);
}

export function getMyHomes(): Record<string, MyHomeState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(HOMES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MyHomeState>) : {};
  } catch {
    return {};
  }
}

export function addMyHome(slug: string) {
  const homes = getMyHomes();
  if (!homes[slug]) homes[slug] = { paid: false, slot: '' };
  window.localStorage.setItem(HOMES_KEY, JSON.stringify(homes));
}

export function setMyHome(slug: string, state: MyHomeState) {
  const homes = getMyHomes();
  homes[slug] = state;
  window.localStorage.setItem(HOMES_KEY, JSON.stringify(homes));
}

export function getPendingSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PENDING_KEY);
}

export function setPendingSlug(slug: string) {
  window.localStorage.setItem(PENDING_KEY, slug);
}

export function clearPendingSlug() {
  window.localStorage.removeItem(PENDING_KEY);
}
