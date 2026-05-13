import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Coins, Flame, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_SEASON } from '../data/seasons';
import { QUESTS } from '../data/quests';
import { pickLocalized, translate } from '../i18n';
import { ENERGY_REFILL_MINUTES, IDLE_REWARD_HOURS, levelProgress } from '../lib/balance';
import { formatCountdown, hours, minutes, nextLocalMidnight } from '../lib/dates';
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
  const refreshPlayer = useGameStore((state) => state.refreshPlayer);
  const [now, setNow] = useState(() => Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      const activePlayer = useGameStore.getState().player;
      if (!activePlayer) return;
      const nextEnergyTime = new Date(activePlayer.energy.lastRefillAt).getTime() + minutes(ENERGY_REFILL_MINUTES);
      if (activePlayer.energy.current < activePlayer.energy.max && current >= nextEnergyTime) {
        useGameStore.getState().refreshPlayer();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!player) return null;

  const stats = calculateHeroStats(player);
  const xpProgress = levelProgress(player.hero.level, player.hero.xp);
  const seasonLevel = Math.min(CURRENT_SEASON.levels, Math.floor(player.season.points / CURRENT_SEASON.pointsPerLevel) + 1);
  const seasonProgress = ((player.season.points % CURRENT_SEASON.pointsPerLevel) / CURRENT_SEASON.pointsPerLevel) * 100;
  const nextEnergyMs = new Date(player.energy.lastRefillAt).getTime() + minutes(ENERGY_REFILL_MINUTES) - now;
  const idleMs = new Date(player.settings.lastIdleClaimAt).getTime() + hours(IDLE_REWARD_HOURS) - now;
  const idleReady = idleMs <= 0;
  const dailyResetMs = nextLocalMidnight(new Date(now)).getTime() - now;

  const handleStart = () => {
    refreshPlayer();
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
        <div className="rounded-2xl border border-white/10 bg-card/90 p-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-white/60"><Battery size={15} /><span>{translate(language, 'common.energy')}</span></div>
          <div className="mt-1 text-lg font-bold text-white">{player.energy.current}/{player.energy.max}</div>
          {player.energy.current < player.energy.max ? (
            <div className="mt-1 text-[11px] text-accent">{translate(language, 'home.nextEnergyShort', { time: formatCountdown(nextEnergyMs) })}</div>
          ) : <div className="mt-1 text-[11px] text-white/40">{translate(language, 'home.energyFull')}</div>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/90 p-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-white/60"><Flame size={15} /><span>{translate(language, 'common.streak')}</span></div>
          <div className="mt-1 text-lg font-bold text-white">{player.streak}</div>
          <div className="mt-1 text-[11px] text-white/45">{translate(language, 'home.streakHint')}</div>
        </div>
        <StatCard icon={<Sparkles size={15} />} label={translate(language, 'common.sparks')} value={player.resources.sparks ?? 0} />
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
        <p className="mb-2 text-sm text-white/60">{translate(language, 'home.idleExplanation')}</p>
        <p className="mb-3 text-xs text-white/45">{translate(language, idleReady ? 'home.idleReady' : 'home.idleTimer', { time: formatCountdown(idleMs) })}</p>
        <PrimaryButton variant={idleReady ? 'primary' : 'secondary'} onClick={claimIdleReward}>{translate(language, 'home.claimIdleReward')}</PrimaryButton>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-bold text-white">{translate(language, 'home.dailyQuests')}</h2>
          <span className="text-xs text-white/45">{translate(language, 'home.dailyQuestReset', { time: formatCountdown(dailyResetMs) })}</span>
        </div>
        {QUESTS.filter((quest) => quest.kind === 'daily').map((quest, index) => {
          const progress = getQuestProgress(player, quest.id);
          const value = progress?.progress ?? 0;
          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-2xl border border-white/10 bg-card/90 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-white">{quest.icon} {pickLocalized(quest.name, language)}</div>
                  <div className="mt-1 text-xs text-white/50">{pickLocalized(quest.description, language)}</div>
                  <div className="mt-1 text-xs text-white/50">{value}/{quest.target}</div>
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
