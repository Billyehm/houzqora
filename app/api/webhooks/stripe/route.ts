import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { markPaymentFailed, markPaymentPaid } from '@/lib/payment-server';

// Stripe webhook: the signature is checked by hand, with no Stripe
// SDK added, so the app keeps its current dependencies. The signed
// payload is timestamp plus body, HMAC SHA256 with the webhook
// secret, compared in constant time. An unsigned or stale webhook
// is rejected before anything is marked paid.
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signature.split(',').map((pair) => {
      const [k, v] = pair.split('=');
      return [k, v];
    })
  );
  const timestamp = Number(parts.t);
  const expected = parts.v1;
  if (!timestamp || !expected) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const signed = `${timestamp}.${payload}`;
  const digest = createHmac('sha256', secret).update(signed).digest('hex');
  const a = Buffer.from(digest);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 500 });
    }
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    if (!verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
    const event = JSON.parse(payload) as { type?: string; data?: { object?: Record<string, unknown> } };
    const session = event.data?.object || {};
    const sessionId = typeof session.id === 'string' ? session.id : '';
    if (!sessionId) {
      return NextResponse.json({ received: true });
    }
    if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
      await markPaymentPaid(sessionId, 'stripe');
    } else if (event.type === 'checkout.session.expired') {
      await markPaymentFailed(sessionId, 'stripe', 'cancelled');
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook failed.' }, { status: 500 });
  }
}
