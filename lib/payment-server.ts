// Server only. Never import this from a client component: it uses
// the service role key, which bypasses row level security. It is
// only used by the payment API route and the provider webhooks.
//
// The rule that makes payments honest: a booking is only marked
// paid here, after a provider confirms the payment. Creating a
// payment, or clicking pay in the browser, never marks it paid.
// Webhook handling is idempotent: a repeat webhook for an already
// paid payment changes nothing, so a provider retry cannot double
// mark a booking.
import { getAdminSupabase } from '@/lib/admin-supabase';

export async function markPaymentPaid(providerPaymentId: string, provider: string): Promise<boolean> {
  const db = getAdminSupabase();
  const { data: payment } = await db
    .from('payments')
    .select('*')
    .eq('provider_payment_id', providerPaymentId)
    .eq('provider', provider)
    .single();
  if (!payment) return false;
  if (payment.status === 'paid') return true;
  await db
    .from('payments')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', payment.id);
  const { data: booking } = await db
    .from('bookings')
    .select('viewing_slot')
    .eq('user_id', payment.user_id)
    .eq('property_slug', payment.property_slug)
    .single();
  await db.from('bookings').upsert(
    {
      user_id: payment.user_id,
      property_slug: payment.property_slug,
      fee_paid: true,
      viewing_slot: booking?.viewing_slot || '',
    },
    { onConflict: 'user_id,property_slug' }
  );
  return true;
}

export async function markPaymentFailed(
  providerPaymentId: string,
  provider: string,
  status: 'failed' | 'cancelled'
): Promise<boolean> {
  const db = getAdminSupabase();
  const { data: payment } = await db
    .from('payments')
    .select('*')
    .eq('provider_payment_id', providerPaymentId)
    .eq('provider', provider)
    .single();
  if (!payment || payment.status === 'paid') return false;
  await db
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', payment.id);
  return true;
}
