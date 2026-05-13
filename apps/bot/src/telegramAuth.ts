import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { env } from './env.js';

export interface TelegramInitUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface VerifiedInitData {
  user: TelegramInitUser;
  authDate: number;
}

export interface AuthedRequest extends Request {
  telegramUser?: TelegramInitUser;
}

function timingSafeHexEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function validateTelegramInitData(initData: string, botToken = env.BOT_TOKEN): VerifiedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('Missing hash');
  params.delete('hash');
  const pairs = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([key, value]) => `${key}=${value}`).join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (!timingSafeHexEqual(computedHash, hash)) throw new Error('Invalid initData hash');
  const authDateRaw = params.get('auth_date');
  const authDate = authDateRaw ? Number(authDateRaw) : 0;
  if (!Number.isFinite(authDate) || authDate <= 0) throw new Error('Invalid auth_date');
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > 24 * 60 * 60) throw new Error('initData expired');
  const userRaw = params.get('user');
  if (!userRaw) throw new Error('Missing user');
  const user = JSON.parse(userRaw) as TelegramInitUser;
  if (!user.id) throw new Error('Missing user id');
  return { user, authDate };
}

export function requireTelegramAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  try {
    const initData = req.header('X-Telegram-Init-Data') || (typeof req.body?.initData === 'string' ? req.body.initData : '');
    if (env.NODE_ENV !== 'production' && !initData) {
      req.telegramUser = { id: 100001, username: 'demo_hero', language_code: 'ru' };
      next();
      return;
    }
    const verified = validateTelegramInitData(initData);
    req.telegramUser = verified.user;
    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: error instanceof Error ? error.message : 'Unauthorized' });
  }
}
