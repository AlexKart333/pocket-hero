import { getState, getUndeliveredPurchases, markPurchasesDelivered, saveState } from './db.js';

export function loadUserState(userId: number): unknown | null {
  return getState(userId);
}

export function saveUserState(userId: number, state: unknown): void {
  saveState(userId, state);
}

export function getPendingPurchases(userId: number): Array<{ id: number; productId: string }> {
  return getUndeliveredPurchases(userId).map((purchase) => ({ id: purchase.id, productId: purchase.product_id }));
}

export function markPendingPurchasesDelivered(userId: number, ids: number[]): void {
  markPurchasesDelivered(userId, ids);
}
