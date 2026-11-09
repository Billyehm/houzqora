export type CookiePrefs = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export const COOKIE_PREFS_KEY = 'houzqora_cookie_prefs';

export const DEFAULT_COOKIE_PREFS: CookiePrefs = {
  preferences: true,
  analytics: false,
  marketing: false,
};

export function loadCookiePrefs(): CookiePrefs {
  if (typeof window === 'undefined') return DEFAULT_COOKIE_PREFS;
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return DEFAULT_COOKIE_PREFS;
    const parsed = JSON.parse(raw) as Partial<CookiePrefs>;
    return {
      preferences: parsed.preferences !== false,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return DEFAULT_COOKIE_PREFS;
  }
}

export function saveCookiePrefs(prefs: CookiePrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage blocked: the choice just will not persist.
  }
}
