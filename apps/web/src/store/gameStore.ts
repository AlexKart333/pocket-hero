import { create } from 'zustand';
import { api, demoPaymentsEnabled } from '../lib/api';
import {
  applyPurchase,
  calculateHeroStats,
  claimIdleReward as engineClaimIdleReward,
  claimQuestReward,
  claimSeasonReward as engineClaimSeasonReward,
  createNewPlayer,
  equipItem as engineEquipItem,
  finishAdventure,
  mergeBattleRewardsIntoRun,
  performBattleTurn,
  refillEnergy,
  resolveRoomChoice,
  sellItem as engineSellItem,
  startAdventure as engineStartAdventure,
  updateDailyStreak,
  updateQuestProgress,
  upgradeHeroStat as engineUpgradeHeroStat
} from '../lib/gameEngine';
import { detectDefaultLanguage } from '../i18n';
import { clearPlayerState, loadLanguage, loadPlayerState, saveLanguage, savePlayerState } from '../lib/storage';
import { telegram } from '../lib/telegram';
import type { AdventureResult, AdventureRun, BattleAction, BattleState, ClassId, HeroTraining, PlayerState, ProductId, ThemeMode } from '../types/game';
import type { Language } from '../types/i18n';

export interface ToastState {
  key: string;
  values?: Record<string, string | number>;
  type: 'success' | 'error' | 'info';
}

type ChoiceOutcome = 'battle' | 'finished' | 'room' | 'none';
type BattleOutcome = 'battle' | 'adventure' | 'result' | 'none';

interface GameStore {
  player: PlayerState | null;
  currentRun: AdventureRun | null;
  currentBattle: BattleState | null;
  lastResult: AdventureResult | null;
  toast: ToastState | null;
  language: Language;
  isHydrated: boolean;
  initApp: () => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  createHero: (classId: ClassId, heroName: string) => void;
  startAdventure: () => boolean;
  chooseRoomOption: (choiceId: string) => ChoiceOutcome;
  battleAction: (action: BattleAction) => BattleOutcome;
  finishRun: (victory?: boolean) => void;
  equipItem: (instanceId: string) => void;
  sellItem: (instanceId: string) => void;
  claimIdleReward: () => void;
  claimQuest: (questId: string) => void;
  claimSeasonReward: (level: number, premium: boolean) => void;
  upgradeHeroStat: (stat: keyof HeroTraining) => void;
  refreshPlayer: () => void;
  buyProduct: (productId: ProductId) => Promise<void>;
  resetProgress: () => void;
  showToast: (toast: ToastState) => void;
  clearToast: () => void;
}

function persist(player: PlayerState | null): void {
  savePlayerState(player);
  if (player) {
    api.saveState(player).catch(() => undefined);
  }
}

function normalizePlayer(player: PlayerState): PlayerState {
  const next = structuredClone(player) as PlayerState;
  const resources = next.resources;
  next.resources = {
    gold: resources?.gold ?? 0,
    gems: resources?.gems ?? 0,
    seasonPoints: resources?.seasonPoints ?? 0,
    sparks: resources?.sparks ?? 0
  };
  next.hero.training = next.hero.training ?? { hp: 0, attack: 0, defense: 0, speed: 0, critChance: 0 };
  return next;
}

function syncPlayer(player: PlayerState): PlayerState {
  const now = new Date();
  let next = normalizePlayer(player);
  next = refillEnergy(next, now);
  next = updateDailyStreak(next, now);
  const stats = calculateHeroStats(next);
  next.hero.currentHp = Math.min(stats.hp, Math.max(1, next.hero.currentHp));
  return next;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  currentRun: null,
  currentBattle: null,
  lastResult: null,
  toast: null,
  language: 'en',
  isHydrated: false,

  initApp: () => {
    telegram.ready();
    const storedLanguage = loadLanguage();
    const language = storedLanguage ?? detectDefaultLanguage(telegram.user.language_code);
    const stored = loadPlayerState();
    const player = stored ? { ...syncPlayer(stored), language } : null;
    set({ player, language, isHydrated: true });
    persist(player);
    if (player && !demoPaymentsEnabled()) {
      api.getUndeliveredPurchases()
        .then(({ purchases }) => {
          if (!purchases.length) return;
          let updated = get().player;
          if (!updated) return;
          for (const purchase of purchases) updated = applyPurchase(updated, purchase.productId, 'telegram');
          set({ player: updated });
          persist(updated);
          api.markPurchasesDelivered(purchases.map((purchase) => purchase.id)).catch(() => undefined);
        })
        .catch(() => undefined);
    }
  },

  setLanguage: (language) => {
    saveLanguage(language);
    const player = get().player;
    const nextPlayer = player ? { ...player, language } : null;
    set({ language, player: nextPlayer });
    persist(nextPlayer);
  },

  setTheme: (theme) => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = { ...player, settings: { ...player.settings, theme } };
    set({ player: nextPlayer });
    persist(nextPlayer);
  },

  createHero: (classId, heroName) => {
    const language = get().language;
    const username = telegram.user.username ?? telegram.user.first_name ?? 'Hero';
    const player = createNewPlayer({ telegramId: telegram.user.id, username, language, heroName, classId });
    set({ player, currentRun: null, currentBattle: null, lastResult: null });
    persist(player);
    telegram.haptic.notification('success');
    get().showToast({ key: 'toast.heroCreated', type: 'success' });
  },

  startAdventure: () => {
    const player = get().player;
    if (!player) return false;
    const { player: nextPlayer, data: run } = engineStartAdventure(player);
    if (!run) {
      set({ player: nextPlayer });
      persist(nextPlayer);
      telegram.haptic.notification('warning');
      get().showToast({ key: 'toast.notEnoughEnergy', type: 'error' });
      return false;
    }
    set({ player: nextPlayer, currentRun: run, currentBattle: null, lastResult: null });
    persist(nextPlayer);
    telegram.haptic.impact('medium');
    get().showToast({ key: 'toast.adventureStarted', type: 'success' });
    return true;
  },

  chooseRoomOption: (choiceId) => {
    const player = get().player;
    const run = get().currentRun;
    if (!player || !run) return 'none';
    const outcome = resolveRoomChoice(player, run, choiceId);
    set({ player: outcome.player, currentRun: outcome.run, currentBattle: outcome.battle ?? null });
    persist(outcome.player);
    telegram.haptic.selection();
    if (outcome.battle) return 'battle';
    if (outcome.run.completed) {
      get().finishRun(outcome.run.victory);
      return 'finished';
    }
    return 'room';
  },

  battleAction: (action) => {
    const player = get().player;
    const battle = get().currentBattle;
    const run = get().currentRun;
    if (!player || !battle || !run) return 'none';
    let nextPlayer = action === 'skill' ? updateQuestProgress(player, { type: 'skill_used', amount: 1 }) : player;
    const nextBattle = performBattleTurn(battle, action);
    telegram.haptic.impact(action === 'defend' ? 'light' : 'medium');
    if (!nextBattle.completed) {
      set({ player: nextPlayer, currentBattle: nextBattle });
      persist(nextPlayer);
      return 'battle';
    }
    const merged = mergeBattleRewardsIntoRun(nextPlayer, run, nextBattle);
    nextPlayer = merged.player;
    if (merged.run.completed) {
      set({ player: nextPlayer, currentRun: merged.run, currentBattle: null });
      persist(nextPlayer);
      get().finishRun(merged.run.victory);
      return 'result';
    }
    set({ player: nextPlayer, currentRun: merged.run, currentBattle: null });
    persist(nextPlayer);
    return 'adventure';
  },

  finishRun: (victory) => {
    const player = get().player;
    const run = get().currentRun;
    if (!player || !run) return;
    const finalRun = { ...run, completed: true, victory: victory ?? run.victory ?? true };
    const { player: nextPlayer, data } = finishAdventure(player, finalRun);
    set({ player: nextPlayer, currentRun: null, currentBattle: null, lastResult: data });
    persist(nextPlayer);
    telegram.haptic.notification(data.victory ? 'success' : 'warning');
  },

  equipItem: (instanceId) => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = engineEquipItem(player, instanceId);
    set({ player: nextPlayer });
    persist(nextPlayer);
    telegram.haptic.selection();
    get().showToast({ key: 'toast.itemEquipped', type: 'success' });
  },

  sellItem: (instanceId) => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = engineSellItem(player, instanceId);
    set({ player: nextPlayer });
    persist(nextPlayer);
    telegram.haptic.notification('success');
    get().showToast({ key: 'toast.itemSold', type: 'success' });
  },

  claimIdleReward: () => {
    const player = get().player;
    if (!player) return;
    const { player: nextPlayer, data } = engineClaimIdleReward(player);
    set({ player: nextPlayer });
    persist(nextPlayer);
    get().showToast({ key: data.available ? 'toast.idleClaimed' : 'home.idleNotReady', type: data.available ? 'success' : 'info' });
  },

  claimQuest: (questId) => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = claimQuestReward(player, questId);
    set({ player: nextPlayer });
    persist(nextPlayer);
    telegram.haptic.notification('success');
    get().showToast({ key: 'toast.questClaimed', type: 'success' });
  },

  claimSeasonReward: (level, premium) => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = engineClaimSeasonReward(player, level, premium);
    set({ player: nextPlayer });
    persist(nextPlayer);
    telegram.haptic.notification('success');
    get().showToast({ key: 'toast.rewardClaimed', type: 'success' });
  },

  upgradeHeroStat: (stat) => {
    const player = get().player;
    if (!player) return;
    const { player: nextPlayer, data } = engineUpgradeHeroStat(player, stat);
    set({ player: nextPlayer });
    persist(nextPlayer);
    telegram.haptic.notification(data.upgraded ? 'success' : 'warning');
    get().showToast({ key: data.upgraded ? 'toast.statUpgraded' : 'toast.notEnoughTrainingCurrency', type: data.upgraded ? 'success' : 'error' });
  },

  refreshPlayer: () => {
    const player = get().player;
    if (!player) return;
    const nextPlayer = syncPlayer(player);
    set({ player: nextPlayer });
    persist(nextPlayer);
  },

  buyProduct: async (productId) => {
    const player = get().player;
    if (!player) return;
    try {
      if (demoPaymentsEnabled()) {
        const nextPlayer = applyPurchase(player, productId, 'demo');
        set({ player: nextPlayer });
        persist(nextPlayer);
        telegram.haptic.notification('success');
        get().showToast({ key: 'shop.purchaseApplied', type: 'success' });
        return;
      }
      const { invoiceLink } = await api.createInvoice(productId);
      telegram.openInvoice(invoiceLink, (status) => {
        if (status === 'paid') get().showToast({ key: 'shop.paymentPending', type: 'success' });
      });
    } catch {
      get().showToast({ key: 'toast.error', type: 'error' });
    }
  },

  resetProgress: () => {
    clearPlayerState();
    set({ player: null, currentRun: null, currentBattle: null, lastResult: null });
    telegram.haptic.notification('warning');
    get().showToast({ key: 'settings.resetDone', type: 'success' });
  },

  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null })
}));
