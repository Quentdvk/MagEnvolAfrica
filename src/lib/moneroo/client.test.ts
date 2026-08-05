import { createHmac } from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { isMonerooConfigured, verifyWebhookSignature } from './client';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('verifyWebhookSignature', () => {
  const payload = JSON.stringify({ event: 'payment.success', data: { id: 'pay_123' } });

  it('accepts a signature computed with the webhook secret', () => {
    process.env.MONEROO_WEBHOOK_SECRET = 'whsec_test';
    const signature = createHmac('sha256', 'whsec_test').update(payload).digest('hex');

    expect(verifyWebhookSignature(payload, signature)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    process.env.MONEROO_WEBHOOK_SECRET = 'whsec_test';
    const signature = createHmac('sha256', 'whsec_test').update(payload).digest('hex');

    expect(verifyWebhookSignature(`${payload} `, signature)).toBe(false);
  });

  it('rejects when the signature header or the secret is missing', () => {
    process.env.MONEROO_WEBHOOK_SECRET = 'whsec_test';
    expect(verifyWebhookSignature(payload, null)).toBe(false);

    delete process.env.MONEROO_WEBHOOK_SECRET;
    const signature = createHmac('sha256', 'whsec_test').update(payload).digest('hex');
    expect(verifyWebhookSignature(payload, signature)).toBe(false);
  });
});

describe('isMonerooConfigured', () => {
  it('follows the presence of MONEROO_SECRET_KEY', () => {
    delete process.env.MONEROO_SECRET_KEY;
    expect(isMonerooConfigured()).toBe(false);

    process.env.MONEROO_SECRET_KEY = 'sk_test';
    expect(isMonerooConfigured()).toBe(true);
  });
});
