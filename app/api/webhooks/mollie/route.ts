import { NextResponse } from 'next/server';
import { markPaymentFailed, markPaymentPaid } from '@/lib/payment-server';

// Mollie webhook: Mollie posts only the payment id, with no
// signature to check. Verification is done by fetching that payment
// from Mollie with the secret key and trusting only Mollie's own
// status. A spoofed webhook with a fake id therefore cannot mark
// anything paid, because Mollie will not report it as paid.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const id = form.get('id');
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Missing payment id.' }, { status: 400 });
    }
    const mollieKey = process.env.MOLLIE_API_KEY;
    if (!mollieKey) {
      return NextResponse.json({ error: 'Mollie is not configured.' }, { status: 500 });
    }
    const res = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    }
    const payment = await res.json();
    if (payment?.status === 'paid') {
      await markPaymentPaid(id, 'mollie');
    } else if (payment?.status === 'failed' || payment?.status === 'expired') {
      await markPaymentFailed(id, 'mollie', 'failed');
    } else if (payment?.status === 'canceled') {
      await markPaymentFailed(id, 'mollie', 'cancelled');
    }
    return new NextResponse('ok', { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Webhook failed.' }, { status: 500 });
  }
}
