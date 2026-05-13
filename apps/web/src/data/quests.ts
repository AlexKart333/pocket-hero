import type { QuestDefinition } from '../types/game';

export const QUESTS: QuestDefinition[] = [
  {
    id: 'daily_complete_1_adventure', kind: 'daily', icon: '🗺️', target: 1, eventType: 'adventure_completed',
    name: { ru: 'Пройти 1 приключение', en: 'Complete 1 adventure' },
    description: { ru: 'Завершите одно короткое путешествие сегодня.', en: 'Finish one short journey today.' },
    reward: { xp: 35, gold: 30, seasonPoints: 20 }
  },
  {
    id: 'daily_win_2_battles', kind: 'daily', icon: '⚔️', target: 2, eventType: 'battle_won',
    name: { ru: 'Победить в 2 боях', en: 'Win 2 battles' },
    description: { ru: 'Одержите две победы над монстрами.', en: 'Defeat two monsters in battle.' },
    reward: { xp: 40, gold: 35, seasonPoints: 25 }
  },
  {
    id: 'daily_find_rare_item', kind: 'daily', icon: '💎', target: 1, eventType: 'rare_item_found',
    name: { ru: 'Найти редкий предмет', en: 'Find 1 rare item' },
    description: { ru: 'Получите предмет редкости rare или выше.', en: 'Loot an item of rare rarity or better.' },
    reward: { xp: 35, gold: 20, seasonPoints: 25 }
  },
  {
    id: 'daily_earn_100_gold', kind: 'daily', icon: '🪙', target: 100, eventType: 'gold_earned',
    name: { ru: 'Заработать 100 золота', en: 'Earn 100 gold' },
    description: { ru: 'Соберите 100 золота любыми игровыми действиями.', en: 'Collect 100 gold through gameplay.' },
    reward: { xp: 25, gold: 40, seasonPoints: 20 }
  },
  {
    id: 'daily_use_skill_3_times', kind: 'daily', icon: '✨', target: 3, eventType: 'skill_used',
    name: { ru: 'Использовать умение 3 раза', en: 'Use a skill 3 times' },
    description: { ru: 'Примените классовое умение трижды.', en: 'Use your class skill three times.' },
    reward: { xp: 30, gold: 25, seasonPoints: 20 }
  },
  {
    id: 'weekly_complete_10_adventures', kind: 'weekly', icon: '🏕️', target: 10, eventType: 'adventure_completed',
    name: { ru: 'Пройти 10 приключений', en: 'Complete 10 adventures' },
    description: { ru: 'Завершите десять путешествий за неделю.', en: 'Complete ten journeys this week.' },
    reward: { xp: 150, gold: 180, seasonPoints: 90 }
  },
  {
    id: 'weekly_defeat_5_bosses', kind: 'weekly', icon: '👑', target: 5, eventType: 'boss_defeated',
    name: { ru: 'Победить 5 боссов', en: 'Defeat 5 bosses' },
    description: { ru: 'Одолейте пять финальных противников.', en: 'Defeat five final enemies.' },
    reward: { xp: 180, gold: 220, seasonPoints: 100 }
  },
  {
    id: 'weekly_collect_20_items', kind: 'weekly', icon: '🎒', target: 20, eventType: 'item_found',
    name: { ru: 'Собрать 20 предметов', en: 'Collect 20 items' },
    description: { ru: 'Найдите двадцать предметов за неделю.', en: 'Find twenty items this week.' },
    reward: { xp: 140, gold: 160, seasonPoints: 80 }
  }
];

export const DAILY_QUESTS = QUESTS.filter((quest) => quest.kind === 'daily');
export const WEEKLY_QUESTS = QUESTS.filter((quest) => quest.kind === 'weekly');
