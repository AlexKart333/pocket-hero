import { motion } from 'framer-motion';
import { Battery, Coins, Flame, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_SEASON } from '../data/seasons';
import { QUESTS } from '../data/quests';
import { pickLocalized, translate } from '../i18n';
import { ENERGY_REFILL_MINUTES, IDLE_REWARD_HOURS, levelProgress } from '../lib/balance';
import { formatCountdown, hours, minutes } from '../lib/dates';
import { calculateHeroStats, getQuestProgress } from '../lib/gameEngine';
import { useGameStore } from '../store/gameStore';
import { HeroAvatar } from '../components/HeroAvatar';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';

export function HomeScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const startAdventure = useGameStore((state) => state.startAdventure);
  const claimIdleReward = useGameStore((state) => state.claimIdleReward);
  const claimQuest = useGameStore((state) => state.claimQuest);
  const navigate = useNavigate();
  if (!player) return null;

  const stats = calculateHeroStats(player);
  const xpProgress = levelProgress(player.hero.level, player.hero.xp);
  const seasonLevel = Math.min(CURRENT_SEASON.levels, Math.floor(player.season.points / CURRENT_SEASON.pointsPerLevel) + 1);
  const seasonProgress = ((player.season.points % CURRENT_SEASON.pointsPerLevel) / CURRENT_SEASON.pointsPerLevel) * 100;
  const nextEnergyAt = new Date(player.energy.lastRefillAt).getTime() + minutes(ENERGY_REFILL_MINUTES) - Date.now();
  const idleReady = Date.now() - new Date(player.settings.lastIdleClaimAt).getTime() >= hours(IDLE_REWARD_HOURS);

  const handleStart = () => {
    if (startAdventure()) navigate('/adventure');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-glow">
        <div className="flex items-center gap-4">
          <HeroAvatar player={player} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/60">{translate(language, 'home.welcome', { name: player.username })}</p>
            <h1 className="truncate text-2xl font-black text-white">{player.hero.name}</h1>
            <p className="text-xs text-white/55">{translate(language, 'common.level')} {player.hero.level} · {translate(language, 'common.hp')} {player.hero.currentHp}/{stats.hp}</p>
            <ProgressBar value={xpProgress} label={`${player.hero.xp}/${100 + (player.hero.level - 1) * 55} ${translate(language, 'common.xp')}`} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Coins size={15} />} label={translate(language, 'common.gold')} value={player.resources.gold} />
        <StatCard icon={<Battery size={15} />} label={translate(language, 'common.energy')} value={`${player.energy.current}/${player.energy.max}`} />
        <StatCard icon={<Flame size={15} />} label={translate(language, 'common.streak')} value={player.streak} />
        <StatCard icon={<Star size={15} />} label={translate(language, 'home.seasonPoints', { points: player.season.points })} value={`${translate(language, 'common.level')} ${seasonLevel}`} />
      </div>

      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{translate(language, 'home.dailyAdventure')}</h2>
            <p className="mt-1 text-sm text-white/60">{translate(language, 'home.dailyAdventureDesc')}</p>
          </div>
          <span className="rounded-2xl bg-accent/20 px-3 py-2 text-2xl">🗺️</span>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={handleStart} disabled={player.energy.current <= 0}>{translate(language, 'home.startAdventure')}</PrimaryButton>
          {player.energy.current <= 0 ? <p className="mt-2 text-center text-xs text-white/50">{translate(language, 'home.nextEnergy', { time: formatCountdown(nextEnergyAt) })}</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-white">{translate(language, 'home.seasonProgress')}</h2>
          <span className="text-xs text-white/60">{pickLocalized(CURRENT_SEASON.name, language)}</span>
        </div>
        <ProgressBar value={seasonProgress} label={translate(language, 'season.level', { level: seasonLevel })} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-white">{translate(language, 'home.claimIdleReward')}</h2>
          <span className="text-xl">⏳</span>
        </div>
        <p className="mb-3 text-sm text-white/60">{translate(language, idleReady ? 'home.idleReady' : 'home.idleNotReady')}</p>
        <PrimaryButton variant={idleReady ? 'primary' : 'secondary'} onClick={claimIdleReward}>{translate(language, 'home.claimIdleReward')}</PrimaryButton>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-white">{translate(language, 'home.dailyQuests')}</h2>
        {QUESTS.filter((quest) => quest.kind === 'daily').map((quest, index) => {
          const progress = getQuestProgress(player, quest.id);
          const value = progress?.progress ?? 0;
          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-2xl border border-white/10 bg-card/90 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-white">{quest.icon} {pickLocalized(quest.name, language)}</div>
                  <div className="text-xs text-white/50">{value}/{quest.target}</div>
                </div>
                <button disabled={!progress?.completed || progress.claimed} onClick={() => claimQuest(quest.id)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
                  {translate(language, progress?.claimed ? 'common.claimed' : 'common.claim')}
                </button>
              </div>
              <div className="mt-2"><ProgressBar value={(value / quest.target) * 100} /></div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
