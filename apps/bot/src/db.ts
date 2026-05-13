import Database from 'better-sqlite3';
import { env } from './env.js';

export interface PurchaseRow {
  id: number;
  user_id: number;
  product_id: string;
  payload: string;
  charge_id: string;
  delivered: 0 | 1;
  created_at: string;
}

const db = new Database(env.DATABASE_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS user_states (
  user_id INTEGER PRIMARY KEY,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  charge_id TEXT NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`);

export function getState(userId: number): unknown | null {
  const row = db.prepare('SELECT state_json FROM user_states WHERE user_id = ?').get(userId) as { state_json: string } | undefined;
  return row ? JSON.parse(row.state_json) : null;
}

export function saveState(userId: number, state: unknown): void {
  db.prepare(`
    INSERT INTO user_states (user_id, state_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
  `).run(userId, JSON.stringify(state), new Date().toISOString());
}

export function insertPurchase(input: { userId: number; productId: string; payload: string; chargeId: string }): void {
  db.prepare('INSERT INTO purchases (user_id, product_id, payload, charge_id, delivered, created_at) VALUES (?, ?, ?, ?, 0, ?)')
    .run(input.userId, input.productId, input.payload, input.chargeId, new Date().toISOString());
}

export function getUndeliveredPurchases(userId: number): PurchaseRow[] {
  return db.prepare('SELECT * FROM purchases WHERE user_id = ? AND delivered = 0 ORDER BY id ASC').all(userId) as PurchaseRow[];
}

export function markPurchasesDelivered(userId: number, ids: number[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE purchases SET delivered = 1 WHERE user_id = ? AND id IN (${placeholders})`).run(userId, ...ids);
}
