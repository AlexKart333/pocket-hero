import { getHeroClass } from '../data/classes';
import { pickLocalized, translate } from '../i18n';
import { trainingCost } from '../lib/balance';
import { calculateHeroStats, getBestItem } from '../lib/gameEngine';
import { telegram } from '../lib/telegram';
import { useGameStore } from '../store/gameStore';
import type { HeroTraining } from '../types/game';
import { HeroAvatar } from '../components/HeroAvatar';
import { ItemCard } from '../components/ItemCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { levelProgress } from '../lib/balance';

const TRAINING_STATS: Array<{ key: keyof HeroTraining; valueKey: string; icon: string }> = [
  { key: 'hp', valueKey: 'common.hp', icon: '❤️' },
  { key: 'attack', valueKey: 'common.attack', icon: '⚔️' },
  { key: 'defense', valueKey: 'common.defense', icon: '🛡️' },
  { key: 'speed', valueKey: 'common.speed', icon: '💨' },
  { key: 'critChance', valueKey: 'common.crit', icon: '🎯' }
];

export function HeroScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const showToast = useGameStore((state) => state.showToast);
  const upgradeHeroStat = useGameStore((state) => state.upgradeHeroStat);
  if (!player) return null;
  const heroClass = getHeroClass(player.hero.classId);
  const stats = calculateHeroStats(player);
  const bestItem = getBestItem(player);
  const training = player.hero.training ?? { hp: 0, attack: 0, defense: 0, speed: 0, critChance: 0 };
  const equippedItems = Object.values(player.equipped)
    .map((instanceId) => player.inventory.find((item) => item.instanceId === instanceId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const shareProfile = async () => {
    await telegram.share(translate(language, 'hero.shareText', { level: player.hero.level, streak: player.streak, wins: player.stats.battlesWon }));
    showToast({ key: 'result.shareCopied', type: 'success' });
  };

  const statValue = (key: keyof HeroTraining): string | number => {
    if (key === 'critChance') return `${Math.round(stats.critChance * 100)}%`;
    return stats[key];
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-5 shadow-glow">
        <div className="flex items-center gap-4">
          <HeroAvatar player={player} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/60">{pickLocalized(heroClass.name, language)}</p>
            <h1 className="truncate text-2xl font-black text-white">{player.hero.name}</h1>
            <ProgressBar value={levelProgress(player.hero.level, player.hero.xp)} label={`${translate(language, 'common.level')} ${player.hero.level}`} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <h2 className="font-bold text-white">{translate(language, 'hero.progressionTitle')}</h2>
        <p className="mt-2 text-sm text-white/60">{translate(language, 'hero.progressionDesc')}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label={translate(language, 'common.sparks')} value={player.resources.sparks ?? 0} />
          <StatCard label={translate(language, 'common.gold')} value={player.resources.gold} />
        </div>
        {player.deathEcho ? (
          <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {translate(language, 'hero.deathEcho', { sparks: player.deathEcho.amount, step: player.deathEcho.step })}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-white">{translate(language, 'hero.stats')}</h2>
        {TRAINING_STATS.map((stat) => {
          const cost = trainingCost(training, stat.key);
          const canUpgrade = (player.resources.sparks ?? 0) >= cost.sparks && player.resources.gold >= cost.gold;
          return (
            <div key={stat.key} className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white">{stat.icon} {translate(language, stat.valueKey)}: {statValue(stat.key)}</div>
                  <div className="mt-1 text-xs text-white/55">{translate(language, `hero.stat.${stat.key}.desc`)}</div>
                  <div className="mt-2 text-xs text-white/45">{translate(language, 'hero.trainingLevel', { level: training[stat.key] })}</div>
                </div>
                <button onClick={() => upgradeHeroStat(stat.key)} disabled={!canUpgrade} className="shrink-0 rounded-2xl bg-primary px-3 py-2 text-xs font-black text-white disabled:bg-white/10 disabled:text-white/40">
                  {translate(language, 'hero.upgrade')}
                </button>
              </div>
              <div className="mt-3 text-xs text-white/50">{translate(language, 'hero.upgradeCost', { sparks: cost.sparks, gold: cost.gold })}</div>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="mb-3 font-bold text-white">{translate(language, 'hero.records')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={translate(language, 'hero.adventuresCompleted')} value={player.stats.adventuresCompleted} />
          <StatCard label={translate(language, 'hero.battlesWon')} value={player.stats.battlesWon} />
          <StatCard label={translate(language, 'hero.battlesLost')} value={player.stats.battlesLost} />
          <StatCard label={translate(language, 'hero.highestDamage')} value={player.stats.highestDamage} />
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-card/90 p-3 text-sm text-white/70">
          {translate(language, 'hero.bestItem')}: {bestItem ? `${bestItem.definition.icon} ${pickLocalized(bestItem.definition.name, language)}` : translate(language, 'common.none')}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-white">{translate(language, 'hero.equipment')}</h2>
        {equippedItems.length ? equippedItems.map((item) => <ItemCard key={item.instanceId} item={item} language={language} equipped />) : <div className="rounded-2xl bg-white/5 p-3 text-sm text-white/50">{translate(language, 'common.none')}</div>}
      </section>

      <PrimaryButton onClick={shareProfile}>{translate(language, 'hero.shareProfile')}</PrimaryButton>
    </div>
  );
}
