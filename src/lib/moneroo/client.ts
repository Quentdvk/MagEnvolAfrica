import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_API_BASE_URL = 'https://api.moneroo.io';

export interface MonerooCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface InitializePaymentInput {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  customer: MonerooCustomer;
  metadata?: Record<string, string>;
  methods?: string[];
}

export interface InitializedPayment {
  id: string;
  checkoutUrl: string;
}

export interface MonerooPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
}

export interface MonerooWebhookEvent {
  event: string;
  data: {
    id: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, string>;
  };
}

export function isMonerooConfigured(): boolean {
  return !!process.env.MONEROO_SECRET_KEY;
}

function apiBaseUrl(): string {
  return process.env.MONEROO_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function secretKey(): string {
  const key = process.env.MONEROO_SECRET_KEY;

  if (!key) {
    throw new Error(
      'Configuration Moneroo manquante : renseignez MONEROO_SECRET_KEY dans les variables d\'environnement.'
    );
  }

  return key;
}

async function monerooRequest<T>(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown }
): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; data?: unknown }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? `Erreur Moneroo (HTTP ${response.status})`);
  }

  return payload?.data as T;
}

export async function initializePayment(
  input: InitializePaymentInput
): Promise<InitializedPayment> {
  const data = await monerooRequest<{ id: string; checkout_url: string }>(
    '/v1/payments/initialize',
    {
      method: 'POST',
      body: {
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        return_url: input.returnUrl,
        customer: {
          email: input.customer.email,
          first_name: input.customer.firstName,
          last_name: input.customer.lastName,
          ...(input.customer.phone ? { phone: input.customer.phone } : {}),
        },
        ...(input.metadata ? { metadata: input.metadata } : {}),
        ...(input.methods ? { methods: input.methods } : {}),
      },
    }
  );

  return { id: data.id, checkoutUrl: data.checkout_url };
}

export async function verifyPayment(paymentId: string): Promise<MonerooPayment> {
  return monerooRequest<MonerooPayment>(`/v1/payments/${paymentId}/verify`, { method: 'GET' });
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const signingSecret = process.env.MONEROO_WEBHOOK_SECRET;

  if (!signingSecret || !signature) {
    return false;
  }

  const expected = createHmac('sha256', signingSecret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
