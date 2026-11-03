// New-user inspection discount, peculiar to each user.
//
// Stored in the browser, keyed by the signed-in user id (or "guest"
// before signup), so one user's countdown, claim and dismissal never
// leak into another user's. A guest who later signs up gets a fresh
// window under their own user id. This is per device: it does not
// follow a user to another device, a server table would be needed
// for that.
//
// Rules:
// - The 7 day window starts the first time this user sees the banner.
// - "Claim and use" activates the discount for the rest of that window.
// - The X before claiming cancels the offer for that user, the banner
//   does not come back. The X after claiming only hides the banner,
//   the discount stays active until the window ends.
// - After the window ends the banner disappears and fees go back to
//   full price.

export const DISCOUNT_PERCENT = 30;
export const DISCOUNT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type DiscountState = {
  startsAt: number;
  claimed: boolean;
  dismissed: boolean;
};

export function discountKey(userId: string | null): string {
  return `houzqora_discount_${userId ?? 'guest'}`;
}

export function loadDiscount(userId: string | null): DiscountState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(discountKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiscountState;
    if (typeof parsed.startsAt !== 'number') return null;
    return { startsAt: parsed.startsAt, claimed: !!parsed.claimed, dismissed: !!parsed.dismissed };
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
