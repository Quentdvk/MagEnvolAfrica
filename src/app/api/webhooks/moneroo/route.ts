import { NextResponse } from 'next/server';
import {
  verifyPayment,
  verifyWebhookSignature,
  type MonerooWebhookEvent,
} from '@/lib/moneroo/client';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const PAYMENT_STATUS_BY_PROVIDER_STATUS: Record<string, 'confirme' | 'echoue'> = {
  success: 'confirme',
  failed: 'echoue',
  cancelled: 'echoue',
};

function periodEnd(from: Date, billingInterval: string): Date {
  const end = new Date(from);

  if (billingInterval === 'annuel') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return end;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, request.headers.get('x-moneroo-signature'))) {
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 403 });
  }

  const db = createServiceRoleClient();

  if (!db) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée sur le serveur." },
      { status: 503 }
    );
  }

  let event: MonerooWebhookEvent;

  try {
    event = JSON.parse(rawBody) as MonerooWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }

  if (!event.event?.startsWith('payment.') || !event.data?.id) {
    return NextResponse.json({ received: true });
  }

  // Moneroo webhooks only carry partial data: the authoritative status comes from the API.
  const payment = await verifyPayment(event.data.id);
  const status = PAYMENT_STATUS_BY_PROVIDER_STATUS[payment.status] ?? 'initie';

  const { data: paymentRow } = await db
    .from('payments')
    .update({
      status,
      webhook_signature_verified: true,
      raw_webhook_payload: event,
    })
    .eq('provider_ref', payment.id)
    .select('id, order_id')
    .maybeSingle();

  const orderId = (paymentRow as { order_id: string | null } | null)?.order_id ?? null;

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  if (status === 'echoue') {
    await db.from('orders').update({ status: 'annulee' }).eq('id', orderId);

    return NextResponse.json({ received: true });
  }

  if (status !== 'confirme') {
    return NextResponse.json({ received: true });
  }

  const { data: order } = await db
    .from('orders')
    .update({ status: 'payee' })
    .eq('id', orderId)
    .select('id, profile_id, order_items(item_type)')
    .maybeSingle();

  const orderRow = order as {
    profile_id: string | null;
    order_items: { item_type: string }[] | null;
  } | null;

  const isSubscription = (orderRow?.order_items ?? []).some(
    (item) => item.item_type === 'abonnement'
  );
  const planId = event.data.metadata?.plan_id ?? payment.metadata?.plan_id;

  if (!isSubscription || !planId || !orderRow?.profile_id) {
    return NextResponse.json({ received: true });
  }

  const { data: plan } = await db
    .from('subscription_plans')
    .select('id, billing_interval')
    .eq('id', planId)
    .maybeSingle();

  const billingInterval = (plan as { billing_interval?: string } | null)?.billing_interval;

  if (!billingInterval) {
    return NextResponse.json({ received: true });
  }

  const start = new Date();

  await db.from('subscriptions').insert({
    profile_id: orderRow.profile_id,
    plan_id: planId,
    status: 'active',
    is_first_period: true,
    current_period_start: start.toISOString(),
    current_period_end: periodEnd(start, billingInterval).toISOString(),
    moneroo_subscription_ref: payment.id,
  });

  return NextResponse.json({ received: true });
}
