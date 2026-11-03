// New-user inspection discount, linked to the user's account.
//
// Signed out: there is no user to link a discount to, so the banner
// is only a generic advert, "30% inspection discount for 7 days",
// with no personal countdown and no personal claim. Claiming it
// takes the visitor to signup, where a personal discount starts.
// Signed in: the discount lives in the user_discounts table, one
// row per account, so it follows the user across devices. The
// browser copy is only a fallback while that table has not been
// run yet: if the table query fails, the browser copy is used
// instead, keyed by user id, so one account never leaks into
// another's.
//
// Rules:
// - The 7 day window starts the first time the signed in user sees
//   the banner.
// - "Claim and use" activates the discount for the rest of that window.
// - The X only hides the banner for this session. It does not cancel
//   the offer: the banner comes back when the user leaves the app and
//   comes back in a new session, and the offer always stays visible
//   in Bookings until the window ends.
// - After the window ends the banner and the Bookings card disappear
//   and fees go back to full price.

export const DISCOUNT_PERCENT = 30;
export const DISCOUNT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type DiscountState = {
  startsAt: number;
  claimed: boolean;
};

export function discountKey(userId: string | null): string {
  return `houzqora_discount_${userId ?? 'guest'}`;
}

function dismissedKey(userId: string | null): string {
  return `houzqora_discount_dismissed_${userId ?? 'guest'}`;
}

// Session only, so closing the tab and coming back later shows the
// banner again. Older records may still carry a dismissed flag, it
// is ignored here on purpose.
export function isBannerDismissed(userId: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(dismissedKey(userId)) === '1';
  } catch {
    return false;
  }
}

export function setBannerDismissed(userId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(dismissedKey(userId), '1');
  } catch {
    // Session storage blocked: the banner just stays visible.
  }
}

export function loadDiscount(userId: string | null): DiscountState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(discountKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiscountState;
    if (typeof parsed.startsAt !== 'number') return null;
    return { startsAt: parsed.startsAt, claimed: !!parsed.claimed };
  } catch {
    return null;
  }
}

export function saveDiscount(userId: string | null, state: DiscountState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(discountKey(userId), JSON.stringify(state));
  } catch {
    // Storage full or blocked: the banner just will not persist.
  }
}

// Account linked discount, table first, browser fallback. Signed
// out users have no personal state, so this returns null for them.
export async function fetchDiscountState(userId: string | null): Promise<DiscountState | null> {
  if (!userId) return null;
  const browserFallback = (): DiscountState => {
    const existing = loadDiscount(userId);
    if (existing) return existing;
    const fresh: DiscountState = { startsAt: Date.now(), claimed: false };
    saveDiscount(userId, fresh);
    return fresh;
  };
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.from('user_discounts').select('starts_at, claimed').eq('user_id', userId).single();
    if (data) {
      const state: DiscountState = { startsAt: new Date(data.starts_at).getTime(), claimed: !!data.claimed };
      saveDiscount(userId, state);
      return state;
    }
    if (error && error.code !== 'PGRST116') throw error;
    // No row yet: first sight for this account starts the window.
    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from('user_discounts').insert({ user_id: userId, starts_at: now, claimed: false });
    if (insertError) {
      const retry = await supabase.from('user_discounts').select('starts_at, claimed').eq('user_id', userId).single();
      if (retry.data) {
        const state: DiscountState = { startsAt: new Date(retry.data.starts_at).getTime(), claimed: !!retry.data.claimed };
        saveDiscount(userId, state);
        return state;
      }
      throw insertError;
    }
    const state: DiscountState = { startsAt: Date.now(), claimed: false };
    saveDiscount(userId, state);
    return state;
  } catch {
    return browserFallback();
  }
}

export async function claimDiscountState(userId: string | null): Promise<DiscountState | null> {
  if (!userId) return null;
  const state = await fetchDiscountState(userId);
  if (!state) return null;
  const claimed: DiscountState = { ...state, claimed: true };
  try {
    const { supabase } = await import('./supabase');
    const { error } = await supabase.from('user_discounts').update({ claimed: true, updated_at: new Date().toISOString() }).eq('user_id', userId);
    if (error) throw error;
  } catch {
    // Table not run yet: the browser copy carries the claim.
  }
  saveDiscount(userId, claimed);
  return claimed;
}

export function isExpired(state: DiscountState, now: number): boolean {
  return now >= state.startsAt + DISCOUNT_WINDOW_MS;
}

export function isDiscountActive(state: DiscountState | null, now: number): boolean {
  return !!state && state.claimed && !isExpired(state, now);
}

export function discountedFee(fee: number): number {
  return Math.round(fee * (1 - DISCOUNT_PERCENT / 100));
}

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export function timeLeft(state: DiscountState, now: number): TimeLeft {
  const ms = Math.max(0, state.startsAt + DISCOUNT_WINDOW_MS - now);
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function formatCountdown(state: DiscountState, now: number): string {
  const t = timeLeft(state, now);
  return `${t.days}d ${t.hours}h ${t.minutes}m ${t.seconds}s`;
}
