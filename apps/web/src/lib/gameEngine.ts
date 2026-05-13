import { HERO_CLASSES, getHeroClass } from '../data/classes';
import { ENEMIES, getScaledEnemy } from '../data/enemies';
import { getItem, ITEMS, RARITIES } from '../data/items';
import { DAILY_QUESTS, QUESTS, WEEKLY_QUESTS } from '../data/quests';
import { CURRENT_SEASON } from '../data/seasons';
import type {
  AdventureResult,
  AdventureRoom,
  AdventureRun,
  BattleAction,
  BattleLogEntry,
  BattleState,
  ClassId,
  CombatStats,
  CreatePlayerInput,
  GameEngineResult,
  GameEventType,
  InventoryItem,
  ItemDefinition,
  PlayerState,
  ProductId,
  QuestProgress,
  Rarity,
  RoomOption
} from '../types/game';
import { ENERGY_MAX, ENERGY_REFILL_MINUTES, IDLE_REWARD_HOURS, itemTypeSlots, rarityMultiplier, rarityOrder, xpForNextLevel } from './balance';
import { createId, createRng } from './rng';
import { dayKey, hours, isSameDay, isYesterday, isoNow, minutes, startOfWeekKey } from './dates';

function clonePlayer(player: PlayerState): PlayerState {
  return structuredClone(player) as PlayerState;
}

function emptyStats(): PlayerState['stats'] {
  return {
    adventuresStarted: 0,
    adventuresCompleted: 0,
    battlesWon: 0,
    battlesLost: 0,
    bossesDefeated: 0,
    itemsFound: 0,
    legendaryFound: 0,
    totalGoldEarned: 0,
    highestDamage: 0
  };
}

function createQuestProgress(now: Date): PlayerState['quests'] {
  return {
    dailyDate: dayKey(now),
    weeklyStart: startOfWeekKey(now),
    progress: QUESTS.map((quest) => ({ questId: quest.id, progress: 0, completed: false, claimed: false }))
  };
}

function ensureQuestWindows(player: PlayerState, now: Date): PlayerState {
  const next = clonePlayer(player);
  const today = dayKey(now);
  const week = startOfWeekKey(now);
  if (next.quests.dailyDate !== today) {
    next.quests.dailyDate = today;
    const dailyIds = new Set(DAILY_QUESTS.map((quest) => quest.id));
    next.quests.progress = next.quests.progress.map((progress) =>
      dailyIds.has(progress.questId) ? { ...progress, progress: 0, completed: false, claimed: false } : progress
    );
  }
  if (next.quests.weeklyStart !== week) {
    next.quests.weeklyStart = week;
    const weeklyIds = new Set(WEEKLY_QUESTS.map((quest) => quest.id));
    next.quests.progress = next.quests.progress.map((progress) =>
      weeklyIds.has(progress.questId) ? { ...progress, progress: 0, completed: false, claimed: false } : progress
    );
  }
  return next;
}

function createInventoryItem(itemId: string, level: number, seed: string, acquiredAt = isoNow()): InventoryItem {
  const definition = getItem(itemId);
  return {
    instanceId: createId('item', `${seed}-${itemId}-${acquiredAt}`),
    itemId,
    rarity: definition?.rarity ?? 'common',
    level,
    acquiredAt,
    locked: false
  };
}

export function createNewPlayer(input: CreatePlayerInput): PlayerState {
  const now = input.now ?? new Date();
  const heroClass = getHeroClass(input.classId);
  const starterItem = createInventoryItem(heroClass.starterItemId, 1, `${input.telegramId ?? 'local'}-${heroClass.id}`, now.toISOString());
  const starterDefinition = getItem(starterItem.itemId);
  const starterEquipped = starterDefinition ? { [starterDefinition.type]: starterItem.instanceId } : { weapon: starterItem.instanceId };
  const username = input.username?.trim() || input.heroName.trim() || 'Hero';
  return {
    id: createId('player', `${input.telegramId ?? 'local'}-${now.toISOString()}`),
    telegramId: input.telegramId,
    username,
    language: input.language,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    lastDailyAt: now.toISOString(),
    streak: 1,
    hero: {
      name: input.heroName.trim() || username,
      classId: input.classId,
      level: 1,
      xp: 0,
      baseStats: heroClass.baseStats,
      currentHp: heroClass.baseStats.hp
    },
    inventory: [starterItem],
    equipped: starterEquipped as PlayerState['equipped'],
    resources: { gold: 80, gems: 0, seasonPoints: 0 },
    energy: { current: ENERGY_MAX, max: ENERGY_MAX, lastRefillAt: now.toISOString() },
    quests: createQuestProgress(now),
    season: {
      seasonId: CURRENT_SEASON.id,
      points: 0,
      claimedFreeLevels: [],
      claimedPremiumLevels: [],
      premium: false,
      startedAt: now.toISOString()
    },
    purchases: [],
    stats: emptyStats(),
    settings: { theme: 'telegram', lastIdleClaimAt: now.toISOString() }
  };
}

export function calculateHeroStats(player: PlayerState): CombatStats {
  const stats: CombatStats = { ...player.hero.baseStats };
  stats.hp += (player.hero.level - 1) * 5;
  stats.attack += Math.floor((player.hero.level - 1) * 1.8);
  stats.defense += Math.floor((player.hero.level - 1) * 1.1);
  stats.speed += Math.floor((player.hero.level - 1) * 0.4);

  for (const instanceId of Object.values(player.equipped)) {
    const inventoryItem = player.inventory.find((item) => item.instanceId === instanceId);
    const definition = inventoryItem ? getItem(inventoryItem.itemId) : undefined;
    if (!inventoryItem || !definition) continue;
    const multiplier = rarityMultiplier(inventoryItem.rarity) + (inventoryItem.level - 1) * 0.08;
    for (const [key, value] of Object.entries(definition.bonuses) as Array<[keyof CombatStats, number]>) {
      if (key === 'critChance') {
        stats[key] += value;
      } else {
        stats[key] += Math.round(value * multiplier);
      }
    }
  }

  return {
    hp: Math.max(1, Math.round(stats.hp)),
    attack: Math.max(1, Math.round(stats.attack)),
    defense: Math.max(0, Math.round(stats.defense)),
    speed: Math.max(1, Math.round(stats.speed)),
    critChance: Math.min(0.55, Math.max(0, Number(stats.critChance.toFixed(3))))
  };
}

export function refillEnergy(player: PlayerState, now: Date = new Date()): PlayerState {
  const next = clonePlayer(player);
  if (next.energy.current >= next.energy.max) {
    next.energy.lastRefillAt = now.toISOString();
    return next;
  }
  const elapsed = now.getTime() - new Date(next.energy.lastRefillAt).getTime();
  const gained = Math.floor(elapsed / minutes(ENERGY_REFILL_MINUTES));
  if (gained <= 0) return next;
  next.energy.current = Math.min(next.energy.max, next.energy.current + gained);
  next.energy.lastRefillAt = new Date(new Date(next.energy.lastRefillAt).getTime() + gained * minutes(ENERGY_REFILL_MINUTES)).toISOString();
  if (next.energy.current >= next.energy.max) next.energy.lastRefillAt = now.toISOString();
  return next;
}

export function updateDailyStreak(player: PlayerState, now: Date = new Date()): PlayerState {
  let next = ensureQuestWindows(player, now);
  if (isSameDay(next.lastSeenAt, now)) {
    next.lastSeenAt = now.toISOString();
    return next;
  }
  next.streak = isYesterday(next.lastSeenAt, now) ? next.streak + 1 : 1;
  next.lastDailyAt = now.toISOString();
  next.lastSeenAt = now.toISOString();
  return next;
}

export function claimIdleReward(player: PlayerState, now: Date = new Date()): GameEngineResult<{ available: boolean; gold: number; xp: number }> {
  let next = clonePlayer(player);
  const elapsed = now.getTime() - new Date(next.settings.lastIdleClaimAt).getTime();
  if (elapsed < hours(IDLE_REWARD_HOURS)) {
    return { player: next, data: { available: false, gold: 0, xp: 0 } };
  }
  const cycles = Math.min(3, Math.floor(elapsed / hours(IDLE_REWARD_HOURS)));
  const gold = cycles * (25 + next.hero.level * 8);
  const xp = cycles * (12 + next.hero.level * 4);
  next.resources.gold += gold;
  next.stats.totalGoldEarned += gold;
  next.settings.lastIdleClaimAt = now.toISOString();
  next = addXp(next, xp);
  next = updateQuestProgress(next, { type: 'gold_earned', amount: gold });
  next = addSeasonPoints(next, cycles * 5);
  return { player: next, data: { available: true, gold, xp } };
}

export function generateRoom(seed: string, step: number): AdventureRoom {
  const rng = createRng(`${seed}-room-${step}`);
  const nonBossEnemies = ENEMIES.filter((enemy) => !enemy.boss);
  const bosses = ENEMIES.filter((enemy) => enemy.boss);
  const types = step >= 3 ? (['monster', 'treasure', 'shrine'] as const) : (['monster', 'treasure', 'shrine', 'trader', 'event'] as const);
  const makeOption = (index: number): RoomOption => {
    const type = step >= 3 && index === 0 ? 'monster' : rng.pick(types);
    const enemyPool = step >= 3 ? bosses : nonBossEnemies;
    const enemy = rng.pick(enemyPool);
    return {
      id: `${step}_${index}_${type}`,
      type,
      labelKey: `adventure.option.${type}.label`,
      descriptionKey: `adventure.option.${type}.description`,
      risk: type === 'monster' ? Math.min(5, 2 + step) : rng.int(1, 4),
      rewardKey:
        type === 'monster'
          ? 'adventure.reward.loot'
          : type === 'treasure'
            ? rng.chance(0.5) ? 'adventure.reward.loot' : 'adventure.reward.gold'
            : type === 'shrine'
              ? 'adventure.reward.heal'
              : type === 'trader'
                ? 'adventure.reward.safe'
                : 'adventure.reward.mystery',
      enemyId: type === 'monster' ? enemy.id : undefined
    };
  };
  let first = makeOption(0);
  let second = makeOption(1);
  if (first.type === second.type && step < 3) second = makeOption(2);
  return { id: `room_${step}_${seed}`, step, options: [first, second] };
}

export function startAdventure(player: PlayerState): GameEngineResult<AdventureRun | null> {
  let next = refillEnergy(player, new Date());
  if (next.energy.current <= 0) return { player: next, data: null };
  const seed = `${next.id}-${Date.now()}-${next.stats.adventuresStarted}`;
  next.energy.current -= 1;
  next.stats.adventuresStarted += 1;
  next = updateQuestProgress(next, { type: 'adventure_started', amount: 1 });
  const run: AdventureRun = {
    id: createId('run', seed),
    seed,
    step: 1,
    maxSteps: 3,
    currentRoom: generateRoom(seed, 1),
    rewards: { xp: 0, gold: 0, seasonPoints: 0, items: [] },
    completed: false,
    roomLog: []
  };
  return { player: next, data: run };
}

export function resolveRoomChoice(player: PlayerState, run: AdventureRun, choiceId: string): { player: PlayerState; run: AdventureRun; battle?: BattleState } {
  const option = run.currentRoom.options.find((item) => item.id === choiceId) ?? run.currentRoom.options[0];
  let nextPlayer = clonePlayer(player);
  let nextRun = structuredClone(run) as AdventureRun;
  const rng = createRng(`${run.seed}-${run.step}-${choiceId}`);

  if (option.type === 'monster') {
    const battle = startBattle(nextPlayer, option.enemyId ?? 'goblin', `${run.seed}-battle-${run.step}`);
    nextRun.roomLog.push({ step: run.step, optionType: 'monster', messageKey: 'adventure.log.monster', values: { enemy: option.enemyId ?? 'goblin' } });
    return { player: nextPlayer, run: nextRun, battle };
  }

  if (option.type === 'treasure') {
    if (rng.chance(0.42)) {
      const item = rollLoot(nextPlayer.hero.level, `${run.seed}-treasure-${run.step}`);
      nextRun.rewards.items.push(item);
      nextRun.roomLog.push({ step: run.step, optionType: 'treasure', messageKey: 'adventure.log.treasureItem', values: { item: item.itemId } });
    } else {
      const gold = rng.int(20, 45) + nextPlayer.hero.level * 4;
      nextRun.rewards.gold += gold;
      nextRun.roomLog.push({ step: run.step, optionType: 'treasure', messageKey: 'adventure.log.treasureGold', values: { gold } });
    }
  }

  if (option.type === 'shrine') {
    const stats = calculateHeroStats(nextPlayer);
    const hp = rng.int(8, 16) + nextPlayer.hero.level * 2;
    nextPlayer.hero.currentHp = Math.min(stats.hp, nextPlayer.hero.currentHp + hp);
    nextRun.rewards.seasonPoints += 12;
    nextRun.roomLog.push({ step: run.step, optionType: 'shrine', messageKey: 'adventure.log.shrineHeal', values: { hp } });
  }

  if (option.type === 'trader') {
    const gold = rng.int(12, 28) + nextPlayer.hero.level * 3;
    nextRun.rewards.gold += gold;
    nextRun.rewards.xp += 10;
    nextRun.roomLog.push({ step: run.step, optionType: 'trader', messageKey: 'adventure.log.traderDeal', values: { gold } });
  }

  if (option.type === 'event') {
    if (rng.chance(0.55)) {
      const gold = rng.int(25, 50);
      nextRun.rewards.gold += gold;
      nextRun.roomLog.push({ step: run.step, optionType: 'event', messageKey: 'adventure.log.eventGold', values: { gold } });
    } else {
      const hp = rng.int(4, 10);
      nextPlayer.hero.currentHp = Math.max(1, nextPlayer.hero.currentHp - hp);
      nextRun.roomLog.push({ step: run.step, optionType: 'event', messageKey: 'adventure.log.eventDamage', values: { hp } });
    }
  }

  if (nextRun.step >= nextRun.maxSteps) {
    nextRun.completed = true;
    nextRun.victory = true;
  } else {
    nextRun.step += 1;
    nextRun.currentRoom = generateRoom(nextRun.seed, nextRun.step);
  }

  return { player: nextPlayer, run: nextRun };
}

export function startBattle(player: PlayerState, enemyId: string, seed = `${Date.now()}`): BattleState {
  const enemy = getScaledEnemy(enemyId, player.hero.level);
  const stats = calculateHeroStats(player);
  return {
    id: createId('battle', `${player.id}-${enemyId}-${seed}`),
    enemyId,
    enemy,
    heroClassId: player.hero.classId,
    heroStats: stats,
    heroHp: Math.min(player.hero.currentHp || stats.hp, stats.hp),
    enemyHp: enemy.hp,
    turn: 1,
    defendNext: false,
    potionUsed: false,
    seed,
    log: [],
    completed: false,
    rewards: { xp: 0, gold: 0, seasonPoints: 0, items: [] }
  };
}

function damageRoll(attack: number, defense: number, rngSeed: string): number {
  const rng = createRng(rngSeed);
  const variance = rng.int(-2, 3);
  return Math.max(1, attack + variance - Math.floor(defense * 0.55));
}

function itemDropFromEnemy(enemyDifficulty: number, heroLevel: number, seed: string): InventoryItem | null {
  const rng = createRng(seed);
  const chance = Math.min(0.22 + enemyDifficulty * 0.025, 0.42);
  return rng.chance(chance) ? rollLoot(heroLevel, `${seed}-drop`) : null;
}

export function performBattleTurn(battleState: BattleState, action: BattleAction): BattleState {
  const battle = structuredClone(battleState) as BattleState;
  if (battle.completed) return battle;

  const rng = createRng(`${battle.seed}-turn-${battle.turn}-${action}`);
  const logs: BattleLogEntry[] = [];
  let heroDamage = 0;
  let skipsEnemy = false;

  if (action === 'potion') {
    if (!battle.potionUsed) {
      const heal = Math.round(battle.heroStats.hp * 0.35);
      battle.heroHp = Math.min(battle.heroStats.hp, battle.heroHp + heal);
      battle.potionUsed = true;
      logs.push({ key: 'battle.log.potion', values: { hp: heal } });
    }
  } else if (action === 'defend') {
    battle.defendNext = true;
    logs.push({ key: 'battle.log.defend' });
  } else if (action === 'skill') {
    const skillSeed = `${battle.seed}-skill-${battle.turn}`;
    if (battle.heroClassId === 'archer') {
      const first = damageRoll(Math.round(battle.heroStats.attack * 0.72), battle.enemy.defense, `${skillSeed}-1`);
      const second = damageRoll(Math.round(battle.heroStats.attack * 0.72), battle.enemy.defense, `${skillSeed}-2`);
      heroDamage = first + second + (rng.chance(battle.heroStats.critChance + 0.1) ? 3 : 0);
      logs.push({ key: 'battle.log.skillArcher', values: { damage: heroDamage } });
    } else if (battle.heroClassId === 'warrior') {
      heroDamage = damageRoll(Math.round(battle.heroStats.attack * 1.15), battle.enemy.defense, skillSeed);
      battle.defendNext = true;
      logs.push({ key: 'battle.log.skillWarrior', values: { damage: heroDamage } });
    } else if (rng.chance(0.82)) {
      heroDamage = damageRoll(Math.round(battle.heroStats.attack * 1.85), battle.enemy.defense, skillSeed);
      logs.push({ key: 'battle.log.skillMage', values: { damage: heroDamage } });
    } else {
      logs.push({ key: 'battle.log.skillMageMiss' });
    }
  } else {
    heroDamage = damageRoll(battle.heroStats.attack, battle.enemy.defense, `${battle.seed}-attack-${battle.turn}`);
    const crit = rng.chance(battle.heroStats.critChance);
    if (crit) heroDamage = Math.round(heroDamage * 1.8);
    logs.push({ key: crit ? 'battle.log.heroCrit' : 'battle.log.heroHit', values: { damage: heroDamage } });
  }

  if (heroDamage > 0) battle.enemyHp = Math.max(0, battle.enemyHp - heroDamage);
  if (battle.enemyHp <= 0) {
    const item = itemDropFromEnemy(battle.enemy.difficulty, Math.max(1, Math.floor(battle.heroStats.hp / 28)), `${battle.seed}-victory-${battle.turn}`);
    battle.completed = true;
    battle.victory = true;
    battle.rewards = {
      xp: battle.enemy.xpReward,
      gold: battle.enemy.goldReward,
      seasonPoints: battle.enemy.boss ? 35 : 15,
      items: item ? [item] : []
    };
    logs.push({ key: 'battle.log.victory', values: { enemy: option.enemyId ?? 'goblin' } });
    battle.log = [...battle.log, ...logs];
    return battle;
  }

  if (!skipsEnemy) {
    const enemyAttack = battle.defendNext ? Math.round(battle.enemy.attack * 0.55) : battle.enemy.attack;
    const damage = damageRoll(enemyAttack, battle.heroStats.defense, `${battle.seed}-enemy-${battle.turn}`);
    battle.heroHp = Math.max(0, battle.heroHp - damage);
    logs.push({ key: battle.defendNext ? 'battle.log.enemyDefended' : 'battle.log.enemyHit', values: { enemy: battle.enemy.name.en, damage } });
    battle.defendNext = false;
  }

  if (battle.heroHp <= 0) {
    battle.completed = true;
    battle.victory = false;
    battle.rewards = {
      xp: battle.enemy.xpReward,
      gold: battle.enemy.goldReward,
      seasonPoints: 5,
      items: []
    };
    logs.push({ key: 'battle.log.loss' });
  }

  battle.turn += 1;
  battle.log = [...battle.log, ...logs].slice(-8);
  return battle;
}

export function finishAdventure(player: PlayerState, run: AdventureRun): GameEngineResult<AdventureResult> {
  let next = clonePlayer(player);
  const victory = run.victory !== false;
  const multiplier = victory ? 1 : 0.3;
  const result: AdventureResult = {
    victory,
    xp: Math.floor(run.rewards.xp * multiplier),
    gold: Math.floor(run.rewards.gold * multiplier),
    seasonPoints: Math.floor(run.rewards.seasonPoints * multiplier),
    items: victory ? run.rewards.items : []
  };
  next.resources.gold += result.gold;
  next.stats.totalGoldEarned += result.gold;
  next.stats.adventuresCompleted += 1;
  next = addXp(next, result.xp);
  next = addSeasonPoints(next, result.seasonPoints);
  for (const item of result.items) next = addItemToInventory(next, item);
  next = updateQuestProgress(next, { type: 'adventure_completed', amount: 1 });
  if (result.gold > 0) next = updateQuestProgress(next, { type: 'gold_earned', amount: result.gold });
  for (const item of result.items) {
    next = updateQuestProgress(next, { type: 'item_found', amount: 1 });
    if (rarityOrder[item.rarity] >= rarityOrder.rare) next = updateQuestProgress(next, { type: 'rare_item_found', amount: 1 });
  }
  return { player: next, data: result };
}

export function rollLoot(playerLevel: number, seed: string): InventoryItem {
  const rng = createRng(seed);
  const roll = rng.next();
  const rarity: Rarity = roll > 0.992 ? 'mythic' : roll > 0.96 ? 'legendary' : roll > 0.84 ? 'epic' : roll > 0.55 ? 'rare' : 'common';
  const candidates = ITEMS.filter((item) => item.rarity === rarity && item.type !== 'cosmetic');
  const fallback = ITEMS.filter((item) => item.rarity === 'common' && item.type !== 'cosmetic');
  const definition = rng.pick(candidates.length ? candidates : fallback);
  return createInventoryItem(definition.id, Math.max(1, playerLevel), seed);
}

export function addItemToInventory(player: PlayerState, item: InventoryItem): PlayerState {
  const next = clonePlayer(player);
  next.inventory.push(item);
  next.stats.itemsFound += 1;
  if (item.rarity === 'legendary' || item.rarity === 'mythic') next.stats.legendaryFound += 1;
  return next;
}

export function equipItem(player: PlayerState, instanceId: string): PlayerState {
  const next = clonePlayer(player);
  const inventoryItem = next.inventory.find((item) => item.instanceId === instanceId);
  const definition = inventoryItem ? getItem(inventoryItem.itemId) : undefined;
  if (!inventoryItem || !definition) return next;
  const slot = itemTypeSlots[definition.type];
  if (next.equipped[slot] === instanceId) {
    delete next.equipped[slot];
  } else {
    next.equipped[slot] = instanceId;
  }
  const stats = calculateHeroStats(next);
  next.hero.currentHp = Math.min(stats.hp, Math.max(1, next.hero.currentHp));
  return next;
}

export function sellItem(player: PlayerState, instanceId: string): PlayerState {
  const next = clonePlayer(player);
  const inventoryItem = next.inventory.find((item) => item.instanceId === instanceId);
  const definition = inventoryItem ? getItem(inventoryItem.itemId) : undefined;
  if (!inventoryItem || !definition || inventoryItem.locked) return next;
  for (const [slot, equippedId] of Object.entries(next.equipped)) {
    if (equippedId === instanceId) delete next.equipped[slot as keyof typeof next.equipped];
  }
  next.inventory = next.inventory.filter((item) => item.instanceId !== instanceId);
  next.resources.gold += definition.sellPrice;
  next.stats.totalGoldEarned += definition.sellPrice;
  return updateQuestProgress(next, { type: 'gold_earned', amount: definition.sellPrice });
}

export function addXp(player: PlayerState, amount: number): PlayerState {
  const next = clonePlayer(player);
  next.hero.xp += Math.max(0, amount);
  return checkLevelUp(next);
}

export function checkLevelUp(player: PlayerState): PlayerState {
  const next = clonePlayer(player);
  let needed = xpForNextLevel(next.hero.level);
  while (next.hero.xp >= needed) {
    next.hero.xp -= needed;
    next.hero.level += 1;
    const stats = calculateHeroStats(next);
    next.hero.currentHp = stats.hp;
    needed = xpForNextLevel(next.hero.level);
  }
  return next;
}

export function updateQuestProgress(player: PlayerState, event: { type: GameEventType; amount?: number }): PlayerState {
  const next = clonePlayer(player);
  const amount = Math.max(1, event.amount ?? 1);
  next.quests.progress = next.quests.progress.map((progress) => {
    const quest = QUESTS.find((item) => item.id === progress.questId);
    if (!quest || quest.eventType !== event.type || progress.claimed) return progress;
    const value = Math.min(quest.target, progress.progress + amount);
    return { ...progress, progress: value, completed: value >= quest.target };
  });
  return next;
}

export function claimQuestReward(player: PlayerState, questId: string): PlayerState {
  let next = clonePlayer(player);
  const quest = QUESTS.find((item) => item.id === questId);
  const progress = next.quests.progress.find((item) => item.questId === questId);
  if (!quest || !progress || !progress.completed || progress.claimed) return next;
  next.quests.progress = next.quests.progress.map((item) => (item.questId === questId ? { ...item, claimed: true } : item));
  next.resources.gold += quest.reward.gold;
  next.stats.totalGoldEarned += quest.reward.gold;
  next = addXp(next, quest.reward.xp);
  next = addSeasonPoints(next, quest.reward.seasonPoints);
  return next;
}

export function addSeasonPoints(player: PlayerState, amount: number): PlayerState {
  const next = clonePlayer(player);
  const safeAmount = Math.max(0, amount);
  next.season.points += safeAmount;
  next.resources.seasonPoints += safeAmount;
  return next;
}

function applySeasonReward(player: PlayerState, level: number, premium: boolean): PlayerState {
  let next = clonePlayer(player);
  const rewardConfig = CURRENT_SEASON.rewards.find((reward) => reward.level === level);
  if (!rewardConfig) return next;
  const reward = premium ? rewardConfig.premium : rewardConfig.free;
  if (reward.gold) {
    next.resources.gold += reward.gold;
    next.stats.totalGoldEarned += reward.gold;
  }
  if (reward.gems) next.resources.gems += reward.gems;
  if (reward.energy) next.energy.current = Math.min(next.energy.max, next.energy.current + reward.energy);
  if (reward.cosmeticItemId && !next.inventory.some((item) => item.itemId === reward.cosmeticItemId)) {
    next = addItemToInventory(next, createInventoryItem(reward.cosmeticItemId, 1, `${next.id}-${level}-${premium}`));
  }
  return next;
}

export function claimSeasonReward(player: PlayerState, level: number, premium: boolean): PlayerState {
  let next = clonePlayer(player);
  const unlockedLevel = Math.floor(next.season.points / CURRENT_SEASON.pointsPerLevel) + 1;
  if (level > CURRENT_SEASON.levels || level > unlockedLevel) return next;
  if (premium && !next.season.premium) return next;
  const list = premium ? next.season.claimedPremiumLevels : next.season.claimedFreeLevels;
  if (list.includes(level)) return next;
  next = applySeasonReward(next, level, premium);
  if (premium) next.season.claimedPremiumLevels.push(level);
  else next.season.claimedFreeLevels.push(level);
  return next;
}

export function applyPurchase(player: PlayerState, productId: ProductId, source: 'demo' | 'telegram' = 'demo'): PlayerState {
  let next = clonePlayer(player);
  next.purchases.push({ productId, purchasedAt: isoNow(), source });
  if (productId === 'premium_pass') {
    next.season.premium = true;
  }
  if (productId === 'energy_pack') {
    next.energy.current = Math.min(next.energy.max, next.energy.current + 5);
  }
  if (productId === 'cosmetic_chest') {
    const cosmetics = ITEMS.filter((item) => item.type === 'cosmetic');
    const owned = new Set(next.inventory.map((item) => item.itemId));
    const cosmetic = cosmetics.find((item) => !owned.has(item.id)) ?? cosmetics[0];
    next = addItemToInventory(next, createInventoryItem(cosmetic.id, 1, `${next.id}-${productId}-${Date.now()}`));
  }
  if (productId === 'starter_bundle') {
    next.resources.gold += 250;
    next.energy.current = Math.min(next.energy.max, next.energy.current + 3);
    next.stats.totalGoldEarned += 250;
    if (!next.inventory.some((item) => item.itemId === 'cosmetic_green_hat')) {
      next = addItemToInventory(next, createInventoryItem('cosmetic_green_hat', 1, `${next.id}-starter-bundle`));
    }
  }
  return next;
}

export function mergeBattleRewardsIntoRun(player: PlayerState, run: AdventureRun, battle: BattleState): { player: PlayerState; run: AdventureRun } {
  let nextPlayer = clonePlayer(player);
  const nextRun = structuredClone(run) as AdventureRun;
  nextPlayer.hero.currentHp = Math.max(1, battle.heroHp);
  nextRun.rewards.xp += battle.rewards.xp;
  nextRun.rewards.gold += battle.rewards.gold;
  nextRun.rewards.seasonPoints += battle.rewards.seasonPoints;
  nextRun.rewards.items.push(...battle.rewards.items);
  if (battle.victory) {
    nextPlayer.stats.battlesWon += 1;
    nextPlayer = updateQuestProgress(nextPlayer, { type: 'battle_won', amount: 1 });
    if (battle.enemy.boss) {
      nextPlayer.stats.bossesDefeated += 1;
      nextPlayer = updateQuestProgress(nextPlayer, { type: 'boss_defeated', amount: 1 });
    }
  } else {
    nextPlayer.stats.battlesLost += 1;
  }
  const damageNumbers = battle.log.flatMap((entry) => (typeof entry.values?.damage === 'number' ? [entry.values.damage] : []));
  const maxDamage = damageNumbers.length ? Math.max(...damageNumbers) : 0;
  nextPlayer.stats.highestDamage = Math.max(nextPlayer.stats.highestDamage, maxDamage);
  if (nextRun.step >= nextRun.maxSteps || !battle.victory) {
    nextRun.completed = true;
    nextRun.victory = Boolean(battle.victory);
  } else {
    nextRun.step += 1;
    nextRun.currentRoom = generateRoom(nextRun.seed, nextRun.step);
  }
  return { player: nextPlayer, run: nextRun };
}

export function getBestItem(player: PlayerState): { item: InventoryItem; definition: ItemDefinition } | null {
  const sorted = [...player.inventory]
    .map((item) => ({ item, definition: getItem(item.itemId) }))
    .filter((entry): entry is { item: InventoryItem; definition: ItemDefinition } => Boolean(entry.definition))
    .sort((a, b) => rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity] || b.item.level - a.item.level);
  return sorted[0] ?? null;
}

export function getQuestProgress(player: PlayerState, questId: string): QuestProgress | undefined {
  return player.quests.progress.find((progress) => progress.questId === questId);
}

export { HERO_CLASSES, ITEMS, RARITIES, QUESTS, CURRENT_SEASON };
