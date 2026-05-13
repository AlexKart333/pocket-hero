import type { ItemType, Rarity } from '../types/game';

export const ENERGY_MAX = 5;
export const ENERGY_REFILL_MINUTES = 30;
export const IDLE_REWARD_HOURS = 4;
export const XP_BASE = 100;
export const XP_GROWTH = 55;

export const rarityOrder: Record<Rarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5
};

export const rarityClass: Record<Rarity, string> = {
  common: 'border-rarity-common/50 bg-rarity-common/10 text-gray-200',
  rare: 'border-rarity-rare/60 bg-rarity-rare/10 text-blue-100',
  epic: 'border-rarity-epic/60 bg-rarity-epic/10 text-purple-100',
  legendary: 'border-rarity-legendary/70 bg-rarity-legendary/10 text-amber-100',
  mythic: 'border-rarity-mythic/80 bg-rarity-mythic/10 text-rose-100'
};

export const itemTypeSlots: Record<ItemType, ItemType> = {
  weapon: 'weapon',
  armor: 'armor',
  pet: 'pet',
  artifact: 'artifact',
  cosmetic: 'cosmetic'
};

export function xpForNextLevel(level: number): number {
  return XP_BASE + (level - 1) * XP_GROWTH;
}

export function levelProgress(level: number, xp: number): number {
  return Math.min(100, Math.round((xp / xpForNextLevel(level)) * 100));
}

export function rarityMultiplier(rarity: Rarity): number {
  return {
    common: 1,
    rare: 1.35,
    epic: 1.8,
    legendary: 2.5,
    mythic: 3.3
  }[rarity];
}
