import type { PlayerState } from '../types/game';

export const STORAGE_KEY = 'pocketHeroState_v1';

interface PersistedPayload {
  version: 1;
  player: PlayerState | null;
}

export function loadPlayerState(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
    if (parsed.version !== 1 || !parsed.player || !parsed.player.hero || !parsed.player.energy) {
      return null;
    }
    return parsed.player;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function savePlayerState(player: PlayerState | null): void {
  try {
    const payload: PersistedPayload = { version: 1, player };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable in private mode; the app remains playable in memory.
  }
}

export function clearPlayerState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function loadLanguage(): 'ru' | 'en' | null {
  const value = localStorage.getItem('pocketHeroLanguage_v1');
  return value === 'ru' || value === 'en' ? value : null;
}

export function saveLanguage(language: 'ru' | 'en'): void {
  localStorage.setItem('pocketHeroLanguage_v1', language);
}
