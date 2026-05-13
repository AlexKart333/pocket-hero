import { telegram } from './telegram';
import type { PlayerState, ProductId } from '../types/game';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': telegram.initData,
      ...(options.headers ?? {})
    }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  validateInitData: () => request<{ ok: boolean; user: unknown }>('/api/validate-init-data', { method: 'POST', body: JSON.stringify({ initData: telegram.initData }) }),
  loadState: () => request<{ state: PlayerState | null }>('/api/state'),
  saveState: (state: PlayerState) => request<{ ok: true }>('/api/state', { method: 'POST', body: JSON.stringify({ state }) }),
  createInvoice: (productId: ProductId) => request<{ invoiceLink: string }>('/api/create-invoice', { method: 'POST', body: JSON.stringify({ productId }) }),
  getUndeliveredPurchases: () => request<{ purchases: Array<{ productId: ProductId; id: number }> }>('/api/purchases/undelivered'),
  markPurchasesDelivered: (ids: number[]) => request<{ ok: true }>('/api/purchases/mark-delivered', { method: 'POST', body: JSON.stringify({ ids }) })
};

export function demoPaymentsEnabled(): boolean {
  return import.meta.env.VITE_DEMO_PAYMENTS === 'true' || !telegram.isTelegram;
}
