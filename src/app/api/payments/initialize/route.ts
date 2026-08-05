import { NextResponse } from 'next/server';
import { z } from 'zod';
import { initializePayment, isMonerooConfigured } from '@/lib/moneroo/client';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const bodySchema = z.discriminatedUnion('itemType', [
  z.object({ itemType: z.literal('abonnement'), planId: z.string().uuid() }),
  z.object({
    itemType: z.literal('magazine'),
    magazineVariantId: z.string().uuid(),
    language: z.string().min(2).max(5).optional(),
  }),
]);

function appUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
}

function splitFullName(fullName: string | null): { firstName: string; lastName: string } {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: 'Client', lastName: 'Envol Africa' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || parts[0],
  };
}

export async function POST(request: Request) {
  if (!isMonerooConfigured()) {
    return NextResponse.json(
      {
        error:
          "Paiement indisponible : la clé MONEROO_SECRET_KEY n'est pas configurée sur le serveur.",
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Paiement indisponible : Supabase n\'est pas configuré sur le serveur.' },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Vous devez être connecté pour effectuer un paiement.' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle();

  const { full_name: fullName, phone } = (profile ?? {}) as {
    full_name?: string | null;
    phone?: string | null;
  };

  const db = createServiceRoleClient() ?? supabase;
  const body = parsed.data;

  let amount: number;
  let description: string;
  let magazineVariantId: string | null = null;
  let language: string | null = null;

  if (body.itemType === 'abonnement') {
    const { data: plan } = await db
      .from('subscription_plans')
      .select('id, code, price_first_period_xof, billing_interval')
      .eq('id', body.planId)
      .eq('is_active', true)
      .maybeSingle();

    if (!plan) {
      return NextResponse.json({ error: "Plan d'abonnement introuvable." }, { status: 404 });
    }

    const planRow = plan as { code: string; price_first_period_xof: string | number };
    amount = Number(planRow.price_first_period_xof);
    description = `Abonnement Envol Africa Magazine (${planRow.code})`;
  } else {
    const { data: variant } = await db
      .from('magazine_variants')
      .select('id, version, price_xof, magazines(numero)')
      .eq('id', body.magazineVariantId)
      .maybeSingle();

    if (!variant) {
      return NextResponse.json({ error: 'Format de magazine introuvable.' }, { status: 404 });
    }

    const variantRow = variant as unknown as {
      id: string;
      version: string;
      price_xof: string | number;
      magazines: { numero: string } | null;
    };

    amount = Number(variantRow.price_xof);
    magazineVariantId = variantRow.id;
    language = body.language ?? null;
    description = `Magazine N°${variantRow.magazines?.numero ?? '—'} (${variantRow.version})`;
  }

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      profile_id: user.id,
      status: 'en_attente_paiement',
      currency: 'XOF',
      total_amount: amount,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
  }

  const orderId = (order as { id: string }).id;

  const { error: itemError } = await db.from('order_items').insert({
    order_id: orderId,
    item_type: body.itemType,
    magazine_variant_id: magazineVariantId,
    language,
    unit_price: amount,
  });

  if (itemError) {
    return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
  }

  const { firstName, lastName } = splitFullName(fullName ?? null);

  try {
    const payment = await initializePayment({
      amount,
      currency: 'XOF',
      description,
      returnUrl: `${appUrl(request)}/paiement/retour`,
      customer: {
        email: user.email,
        firstName,
        lastName,
        ...(phone ? { phone } : {}),
      },
      metadata: {
        order_id: orderId,
        item_type: body.itemType,
        ...(body.itemType === 'abonnement' ? { plan_id: body.planId } : {}),
      },
    });

    await db.from('orders').update({ moneroo_payment_ref: payment.id }).eq('id', orderId);
    await db.from('payments').insert({
      order_id: orderId,
      provider: 'moneroo',
      provider_ref: payment.id,
      amount,
      currency: 'XOF',
      status: 'initie',
    });

    return NextResponse.json({ checkoutUrl: payment.checkoutUrl, paymentId: payment.id });
  } catch (error) {
    await db.from('orders').update({ status: 'annulee' }).eq('id', orderId);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de paiement Moneroo.' },
      { status: 502 }
    );
  }
}
