import { getHeroClass } from '../data/classes';
import { getItem } from '../data/items';
import { pickLocalized, translate } from '../i18n';
import { calculateHeroStats, getBestItem } from '../lib/gameEngine';
import { telegram } from '../lib/telegram';
import { useGameStore } from '../store/gameStore';
import { HeroAvatar } from '../components/HeroAvatar';
import { ItemCard } from '../components/ItemCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { levelProgress } from '../lib/balance';

export function HeroScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const showToast = useGameStore((state) => state.showToast);
  if (!player) return null;
  const heroClass = getHeroClass(player.hero.classId);
  const stats = calculateHeroStats(player);
  const bestItem = getBestItem(player);
  const equippedItems = Object.values(player.equipped)
    .map((instanceId) => player.inventory.find((item) => item.instanceId === instanceId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const shareProfile = async () => {
    await telegram.share(translate(language, 'hero.shareText', { level: player.hero.level, streak: player.streak, wins: player.stats.battlesWon }));
    showToast({ key: 'result.shareCopied', type: 'success' });
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

      <section>
        <h2 className="mb-3 font-bold text-white">{translate(language, 'hero.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={translate(language, 'common.hp')} value={`${player.hero.currentHp}/${stats.hp}`} />
          <StatCard label={translate(language, 'common.attack')} value={stats.attack} />
          <StatCard label={translate(language, 'common.defense')} value={stats.defense} />
          <StatCard label={translate(language, 'common.speed')} value={stats.speed} />
          <StatCard label={translate(language, 'common.crit')} value={`${Math.round(stats.critChance * 100)}%`} />
          <StatCard label={translate(language, 'common.streak')} value={player.streak} />
        </div>
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
