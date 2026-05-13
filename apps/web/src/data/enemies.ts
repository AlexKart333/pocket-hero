import type { EnemyDefinition } from '../types/game';

export const ENEMIES: EnemyDefinition[] = [
  { id: 'goblin', icon: '👺', name: { ru: 'Гоблин', en: 'Goblin' }, hp: 20, attack: 6, defense: 1, xpReward: 22, goldReward: 18, difficulty: 1 },
  { id: 'wolf', icon: '🐺', name: { ru: 'Волк', en: 'Wolf' }, hp: 22, attack: 7, defense: 1, xpReward: 24, goldReward: 16, difficulty: 1 },
  { id: 'skeleton', icon: '💀', name: { ru: 'Скелет', en: 'Skeleton' }, hp: 24, attack: 7, defense: 2, xpReward: 26, goldReward: 19, difficulty: 2 },
  { id: 'slime', icon: '🟢', name: { ru: 'Слизень', en: 'Slime' }, hp: 28, attack: 5, defense: 3, xpReward: 25, goldReward: 20, difficulty: 2 },
  { id: 'bandit', icon: '🥷', name: { ru: 'Бандит', en: 'Bandit' }, hp: 30, attack: 8, defense: 3, xpReward: 34, goldReward: 28, difficulty: 3 },
  { id: 'dark_mage', icon: '🧙‍♂️', name: { ru: 'Тёмный маг', en: 'Dark Mage' }, hp: 26, attack: 11, defense: 2, xpReward: 38, goldReward: 32, difficulty: 3 },
  { id: 'cave_troll', icon: '🧌', name: { ru: 'Пещерный тролль', en: 'Cave Troll' }, hp: 42, attack: 10, defense: 5, xpReward: 48, goldReward: 38, difficulty: 4 },
  { id: 'mimic', icon: '🎁', name: { ru: 'Мимик', en: 'Mimic' }, hp: 35, attack: 12, defense: 4, xpReward: 46, goldReward: 44, difficulty: 4 },
  { id: 'bat_swarm', icon: '🦇', name: { ru: 'Стая летучих мышей', en: 'Bat Swarm' }, hp: 32, attack: 9, defense: 2, xpReward: 40, goldReward: 30, difficulty: 3 },
  { id: 'orc_brute', icon: '🪓', name: { ru: 'Орк-громила', en: 'Orc Brute' }, hp: 46, attack: 13, defense: 5, xpReward: 58, goldReward: 50, difficulty: 5 },
  { id: 'goblin_king', icon: '👑', name: { ru: 'Король гоблинов', en: 'Goblin King' }, hp: 58, attack: 14, defense: 6, xpReward: 85, goldReward: 75, difficulty: 6, boss: true },
  { id: 'dragon_whelp', icon: '🐉', name: { ru: 'Драконий детёныш', en: 'Dragon Whelp' }, hp: 62, attack: 16, defense: 6, xpReward: 95, goldReward: 88, difficulty: 7, boss: true }
];

export function getEnemy(id: string): EnemyDefinition {
  return ENEMIES.find((enemy) => enemy.id === id) ?? ENEMIES[0];
}

export function getScaledEnemy(id: string, heroLevel: number): EnemyDefinition {
  const base = getEnemy(id);
  const levelScale = Math.max(0, heroLevel - 1);
  return {
    ...base,
    hp: base.hp + levelScale * 6,
    attack: base.attack + Math.floor(levelScale * 1.5),
    defense: base.defense + Math.floor(levelScale * 0.6),
    xpReward: base.xpReward + levelScale * 8,
    goldReward: base.goldReward + levelScale * 6
  };
}
