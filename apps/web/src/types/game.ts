import type { Language, LocalizedText } from './i18n';

export type ClassId = 'warrior' | 'mage' | 'archer';
export type ItemType = 'weapon' | 'armor' | 'pet' | 'artifact' | 'cosmetic';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type RoomType = 'monster' | 'treasure' | 'shrine' | 'trader' | 'event';
export type BattleAction = 'attack' | 'skill' | 'defend' | 'potion';
export type ThemeMode = 'telegram' | 'dark' | 'light';
export type ProductId = 'premium_pass' | 'energy_pack' | 'cosmetic_chest' | 'starter_bundle';
export type QuestKind = 'daily' | 'weekly';
export type GameEventType =
  | 'adventure_started'
  | 'adventure_completed'
  | 'battle_won'
  | 'boss_defeated'
  | 'item_found'
  | 'rare_item_found'
  | 'gold_earned'
  | 'skill_used';

export interface CombatStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
}

export interface HeroClass {
  id: ClassId;
  name: LocalizedText;
  description: LocalizedText;
  baseStats: CombatStats;
  starterItemId: string;
  icon: string;
  skillName: LocalizedText;
  skillDescription: LocalizedText;
}

export interface ItemDefinition {
  id: string;
  type: ItemType;
  rarity: Rarity;
  name: LocalizedText;
  description: LocalizedText;
  bonuses: Partial<CombatStats>;
  sellPrice: number;
  icon: string;
  tags: string[];
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  rarity: Rarity;
  level: number;
  acquiredAt: string;
  locked: boolean;
}

export interface Equipped {
  weapon?: string;
  armor?: string;
  pet?: string;
  artifact?: string;
  cosmetic?: string;
}

export interface HeroTraining {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
}

export interface Hero {
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  baseStats: CombatStats;
  currentHp: number;
  training: HeroTraining;
}

export interface Resources {
  gold: number;
  gems: number;
  seasonPoints: number;
  sparks: number;
}

export interface EnergyState {
  current: number;
  max: number;
  lastRefillAt: string;
}

export interface QuestDefinition {
  id: string;
  kind: QuestKind;
  name: LocalizedText;
  description: LocalizedText;
  target: number;
  eventType: GameEventType;
  reward: {
    xp: number;
    gold: number;
    seasonPoints: number;
  };
  icon: string;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerQuests {
  dailyDate: string;
  weeklyStart: string;
  progress: QuestProgress[];
}

export interface SeasonState {
  seasonId: string;
  points: number;
  claimedFreeLevels: number[];
  claimedPremiumLevels: number[];
  premium: boolean;
  startedAt: string;
}

export interface PurchaseRecord {
  productId: ProductId;
  purchasedAt: string;
  source: 'demo' | 'telegram';
}

export interface PlayerStats {
  adventuresStarted: number;
  adventuresCompleted: number;
  battlesWon: number;
  battlesLost: number;
  bossesDefeated: number;
  itemsFound: number;
  legendaryFound: number;
  totalGoldEarned: number;
  highestDamage: number;
}

export interface PlayerSettings {
  theme: ThemeMode;
  lastIdleClaimAt: string;
}

export interface DeathEcho {
  amount: number;
  enemyId: string;
  step: number;
  createdAt: string;
}

export interface PlayerState {
  id: string;
  telegramId?: number;
  username: string;
  language: Language;
  createdAt: string;
  lastSeenAt: string;
  lastDailyAt: string;
  streak: number;
  hero: Hero;
  inventory: InventoryItem[];
  equipped: Equipped;
  resources: Resources;
  energy: EnergyState;
  quests: PlayerQuests;
  season: SeasonState;
  purchases: PurchaseRecord[];
  stats: PlayerStats;
  settings: PlayerSettings;
  deathEcho?: DeathEcho;
}

export interface EnemyDefinition {
  id: string;
  name: LocalizedText;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  difficulty: number;
  icon: string;
  boss?: boolean;
}

export interface RoomOption {
  id: string;
  type: RoomType;
  labelKey: string;
  descriptionKey: string;
  risk: number;
  rewardKey: string;
  enemyId?: string;
}

export interface AdventureRoom {
  id: string;
  step: number;
  locationKey: string;
  locationDescriptionKey: string;
  options: [RoomOption, RoomOption];
}

export interface AdventureReward {
  xp: number;
  gold: number;
  seasonPoints: number;
  sparks: number;
  items: InventoryItem[];
}

export interface RoomLogEntry {
  step: number;
  optionType: RoomType;
  messageKey: string;
  values?: Record<string, string | number>;
}

export interface AdventureRun {
  id: string;
  seed: string;
  step: number;
  maxSteps: number;
  currentRoom: AdventureRoom;
  rewards: AdventureReward;
  completed: boolean;
  victory?: boolean;
  deathEcho?: Pick<DeathEcho, 'enemyId' | 'step'>;
  roomLog: RoomLogEntry[];
}

export interface BattleLogEntry {
  key: string;
  values?: Record<string, string | number>;
}

export interface BattleState {
  id: string;
  enemyId: string;
  enemy: EnemyDefinition;
  heroClassId: ClassId;
  heroStats: CombatStats;
  heroHp: number;
  enemyHp: number;
  turn: number;
  defendNext: boolean;
  potionUsed: boolean;
  seed: string;
  log: BattleLogEntry[];
  completed: boolean;
  victory?: boolean;
  rewards: AdventureReward;
}

export interface AdventureResult {
  victory: boolean;
  xp: number;
  gold: number;
  seasonPoints: number;
  sparks: number;
  lostSparks: number;
  recoveredSparks: number;
  healthRestored: boolean;
  items: InventoryItem[];
}

export interface SeasonReward {
  level: number;
  free: {
    gold?: number;
    gems?: number;
    energy?: number;
    cosmeticItemId?: string;
  };
  premium: {
    gold?: number;
    gems?: number;
    energy?: number;
    cosmeticItemId?: string;
  };
}

export interface SeasonConfig {
  id: string;
  name: LocalizedText;
  durationDays: number;
  levels: number;
  pointsPerLevel: number;
  rewards: SeasonReward[];
}

export interface ShopProduct {
  id: ProductId;
  name: LocalizedText;
  description: LocalizedText;
  priceStars: number;
  icon: string;
}

export interface CreatePlayerInput {
  telegramId?: number;
  username?: string;
  language: Language;
  heroName: string;
  classId: ClassId;
  now?: Date;
}

export interface GameEngineResult<T> {
  player: PlayerState;
  data: T;
}
