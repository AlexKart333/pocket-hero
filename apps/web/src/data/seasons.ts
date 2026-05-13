import type { SeasonConfig } from '../types/game';

export const CURRENT_SEASON: SeasonConfig = {
  id: 'season_1',
  name: { ru: 'Сезон 1: Вторжение гоблинов', en: 'Season 1: Goblin Invasion' },
  durationDays: 30,
  levels: 20,
  pointsPerLevel: 100,
  rewards: Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    return {
      level,
      free: level % 5 === 0 ? { gold: level * 35, gems: 5 } : { gold: level * 25 },
      premium:
        level === 5
          ? { cosmeticItemId: 'cosmetic_gold_cape', energy: 1, gold: 80 }
          : level === 10
            ? { cosmeticItemId: 'cosmetic_goblin_mask', gems: 20, gold: 150 }
            : level === 15
              ? { cosmeticItemId: 'cosmetic_star_aura', gems: 30, gold: 220 }
              : level === 20
                ? { cosmeticItemId: 'cosmetic_void_crown', gems: 50, gold: 400 }
                : { gold: level * 45, energy: level % 3 === 0 ? 1 : 0 }
    };
  })
};
