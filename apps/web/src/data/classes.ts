import type { HeroClass } from '../types/game';

export const HERO_CLASSES: HeroClass[] = [
  {
    id: 'warrior',
    icon: '🛡️',
    starterItemId: 'weapon_rusty_sword',
    name: { ru: 'Воин', en: 'Warrior' },
    description: { ru: 'Живучий защитник с мощной бронёй и стабильным уроном.', en: 'A durable defender with heavy armor and steady damage.' },
    baseStats: { hp: 34, attack: 8, defense: 6, speed: 3, critChance: 0.08 },
    skillName: { ru: 'Удар щитом', en: 'Shield Bash' },
    skillDescription: { ru: 'Наносит урон и усиливает защиту на следующий ход.', en: 'Deals damage and boosts defense for the next turn.' }
  },
  {
    id: 'mage',
    icon: '🔥',
    starterItemId: 'weapon_apprentice_staff',
    name: { ru: 'Маг', en: 'Mage' },
    description: { ru: 'Хрупкий заклинатель с высоким взрывным уроном.', en: 'A fragile caster with high burst damage.' },
    baseStats: { hp: 24, attack: 12, defense: 2, speed: 5, critChance: 0.1 },
    skillName: { ru: 'Огненный шар', en: 'Fireball' },
    skillDescription: { ru: 'Сильный удар с шансом промаха.', en: 'A powerful blast with a chance to miss.' }
  },
  {
    id: 'archer',
    icon: '🏹',
    starterItemId: 'weapon_hunter_bow',
    name: { ru: 'Лучник', en: 'Archer' },
    description: { ru: 'Быстрый охотник с высоким шансом критического удара.', en: 'A fast hunter with a high critical strike chance.' },
    baseStats: { hp: 28, attack: 9, defense: 4, speed: 8, critChance: 0.18 },
    skillName: { ru: 'Двойной выстрел', en: 'Double Shot' },
    skillDescription: { ru: 'Две быстрые атаки с повышенным шансом крита.', en: 'Two quick attacks with increased crit chance.' }
  }
];

export function getHeroClass(id: string): HeroClass {
  return HERO_CLASSES.find((heroClass) => heroClass.id === id) ?? HERO_CLASSES[0];
}
