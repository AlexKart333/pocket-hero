import express from 'express';
import { createInvoiceLink } from './payments.js';
import { requireTelegramAuth, validateTelegramInitData, type AuthedRequest } from './telegramAuth.js';
import { getPendingPurchases, loadUserState, markPendingPurchasesDelivered, saveUserState } from './gameState.js';

export const routes = express.Router();

routes.get('/health', (_req, res) => {
  res.json({ ok: true });
});

routes.post('/api/validate-init-data', (req, res) => {
  try {
    const initData = typeof req.body?.initData === 'string' ? req.body.initData : '';
    const verified = validateTelegramInitData(initData);
    res.json({ ok: true, user: verified.user });
  } catch (error) {
    res.status(401).json({ ok: false, error: error instanceof Error ? error.message : 'Invalid initData' });
  }
});

routes.get('/api/state', requireTelegramAuth, (req: AuthedRequest, res) => {
  const userId = req.telegramUser?.id;
  if (!userId) return res.status(401).json({ ok: false });
  res.json({ state: loadUserState(userId) });
});

routes.post('/api/state', requireTelegramAuth, (req: AuthedRequest, res) => {
  const userId = req.telegramUser?.id;
  if (!userId) return res.status(401).json({ ok: false });
  saveUserState(userId, req.body?.state ?? null);
  res.json({ ok: true });
});

routes.post('/api/create-invoice', requireTelegramAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.telegramUser?.id;
    const productId = typeof req.body?.productId === 'string' ? req.body.productId : '';
    if (!userId) return res.status(401).json({ ok: false });
    const invoiceLink = await createInvoiceLink(userId, productId);
    res.json({ invoiceLink });
  } catch (error) {
    res.status(400).json({ ok: false, error: error instanceof Error ? error.message : 'Invoice error' });
  }
});

routes.get('/api/purchases/undelivered', requireTelegramAuth, (req: AuthedRequest, res) => {
  const userId = req.telegramUser?.id;
  if (!userId) return res.status(401).json({ ok: false });
  res.json({ purchases: getPendingPurchases(userId) });
});

routes.post('/api/purchases/mark-delivered', requireTelegramAuth, (req: AuthedRequest, res) => {
  const userId = req.telegramUser?.id;
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id: unknown): id is number => typeof id === 'number') : [];
  if (!userId) return res.status(401).json({ ok: false });
  markPendingPurchasesDelivered(userId, ids);
  res.json({ ok: true });
});
