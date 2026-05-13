import { env } from './env.js';

export interface PaymentProduct {
  id: string;
  title: string;
  description: string;
  priceStars: number;
}

export const PAYMENT_PRODUCTS: PaymentProduct[] = [
  { id: 'premium_pass', title: 'Premium Season Pass', description: 'Unlocks premium season rewards.', priceStars: 199 },
  { id: 'energy_pack', title: 'Energy Pack', description: 'Adds energy for extra adventures.', priceStars: 49 },
  { id: 'cosmetic_chest', title: 'Cosmetic Chest', description: 'Cosmetic reward only. No combat loot.', priceStars: 99 },
  { id: 'starter_bundle', title: 'Starter Bundle', description: 'Gold, energy and cosmetic. No legendary weapon.', priceStars: 149 }
];

export function getPaymentProduct(productId: string): PaymentProduct | undefined {
  return PAYMENT_PRODUCTS.find((product) => product.id === productId);
}

export function createPaymentPayload(userId: number, productId: string): string {
  return JSON.stringify({ userId, productId, timestamp: Date.now() });
}

export function parsePaymentPayload(payload: string): { userId: number; productId: string; timestamp: number } {
  const parsed = JSON.parse(payload) as { userId?: unknown; productId?: unknown; timestamp?: unknown };
  if (typeof parsed.userId !== 'number' || typeof parsed.productId !== 'string' || typeof parsed.timestamp !== 'number') {
    throw new Error('Invalid payment payload');
  }
  return parsed as { userId: number; productId: string; timestamp: number };
}

export async function createInvoiceLink(userId: number, productId: string): Promise<string> {
  const product = getPaymentProduct(productId);
  if (!product) throw new Error('Unknown product');
  const payload = createPaymentPayload(userId, productId);
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: product.title,
      description: product.description,
      payload,
      currency: 'XTR',
      provider_token: '',
      prices: [{ label: product.title, amount: product.priceStars }]
    })
  });
  const data = (await response.json()) as { ok: boolean; result?: string; description?: string };
  if (!data.ok || !data.result) throw new Error(data.description || 'Telegram invoice creation failed');
  return data.result;
}
