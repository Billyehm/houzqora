// Server-only discount check for the payment route.
//
// The display side (InspectionFee) already slashes the fee when the
// discount is claimed and inside its 7 day window, but the payment
// route never looked at the discount, so the customer was charged
// the full fee even while the page showed the slashed one. This
// closes that gap: the fee actually charged is the discounted fee
// whenever the account discount is active.
//
// The check reads the account-linked discount straight from the
// user_discounts table with the service role key, so the amount
// charged is never decided by the browser. Same rules as the
// display side, through isDiscountActive: claimed and inside the
// 7 day window. Unclaimed, expired, missing row or any error means
// the full fee, so a discount problem can never block a payment.
import { getAdminSupabase } from '@/lib/admin-supabase';
import { discountedFee, isDiscountActive, type DiscountState } from '@/lib/discount';

export async function getFeeToCharge(userId: string, fee: number): Promise<number> {
  try {
    const db = getAdminSupabase();
    const { data } = await db
      .from('user_discounts')
      .select('starts_at, claimed')
      .eq('user_id', userId)
      .single();
    if (!data) return fee;
    const state: DiscountState = {
      startsAt: new Date(data.starts_at).getTime(),
      claimed: !!data.claimed,
    };
    if (!isDiscountActive(state, Date.now())) return fee;
    return discountedFee(fee);
  } catch {
    return fee;
  }
}
