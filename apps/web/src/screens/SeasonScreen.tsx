import { CURRENT_SEASON } from '../data/seasons';
import { getItem } from '../data/items';
import { pickLocalized, translate } from '../i18n';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';

export function SeasonScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const claimSeasonReward = useGameStore((state) => state.claimSeasonReward);
  const buyProduct = useGameStore((state) => state.buyProduct);
  if (!player) return null;
  const seasonLevel = Math.min(CURRENT_SEASON.levels, Math.floor(player.season.points / CURRENT_SEASON.pointsPerLevel) + 1);
  const progress = ((player.season.points % CURRENT_SEASON.pointsPerLevel) / CURRENT_SEASON.pointsPerLevel) * 100;
  const remaining = CURRENT_SEASON.pointsPerLevel - (player.season.points % CURRENT_SEASON.pointsPerLevel);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-5 shadow-glow">
        <p className="text-sm text-white/60">{translate(language, 'season.title')}</p>
        <h1 className="text-2xl font-black text-white">{pickLocalized(CURRENT_SEASON.name, language)}</h1>
        <div className="mt-4">
          <ProgressBar value={progress} label={translate(language, 'season.level', { level: seasonLevel })} />
          <p className="mt-2 text-xs text-white/50">{translate(language, 'season.pointsToNext', { points: remaining })}</p>
        </div>
        <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm text-white/70">
          {player.season.premium ? translate(language, 'season.premiumActive') : translate(language, 'shop.noPaidPower')}
        </div>
        {!player.season.premium ? <PrimaryButton className="mt-4" onClick={() => buyProduct('premium_pass')}>{translate(language, 'season.buyPremium')}</PrimaryButton> : null}
      </section>

      <section className="space-y-3">
        {CURRENT_SEASON.rewards.map((reward) => {
          const unlocked = reward.level <= seasonLevel;
          const freeClaimed = player.season.claimedFreeLevels.includes(reward.level);
          const premiumClaimed = player.season.claimedPremiumLevels.includes(reward.level);
          return (
            <div key={reward.level} className={`rounded-3xl border p-4 ${unlocked ? 'border-primary/30 bg-card/90' : 'border-white/10 bg-white/5 opacity-70'}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-white">{translate(language, 'season.level', { level: reward.level })}</h3>
                <span className="text-xs text-white/50">{unlocked ? translate(language, 'common.available') : translate(language, 'common.locked')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <RewardColumn title={translate(language, 'season.free')} lines={rewardLines(reward.free, language)} claimed={freeClaimed} disabled={!unlocked || freeClaimed} onClaim={() => claimSeasonReward(reward.level, false)} language={language} />
                <RewardColumn title={translate(language, 'season.premium')} lines={rewardLines(reward.premium, language)} claimed={premiumClaimed} disabled={!unlocked || premiumClaimed || !player.season.premium} onClaim={() => claimSeasonReward(reward.level, true)} language={language} />
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function rewardLines(reward: { gold?: number; gems?: number; energy?: number; cosmeticItemId?: string }, language: 'ru' | 'en'): string[] {
  const lines: string[] = [];
  if (reward.gold) lines.push(translate(language, 'season.rewardGold', { gold: reward.gold }));
  if (reward.gems) lines.push(translate(language, 'season.rewardGems', { gems: reward.gems }));
  if (reward.energy) lines.push(translate(language, 'season.rewardEnergy', { energy: reward.energy }));
  if (reward.cosmeticItemId) {
    const item = getItem(reward.cosmeticItemId);
    lines.push(translate(language, 'season.rewardCosmetic', { item: item ? pickLocalized(item.name, language) : reward.cosmeticItemId }));
  }
  return lines.length ? lines : [translate(language, 'common.reward')];
}

function RewardColumn({ title, lines, claimed, disabled, onClaim, language }: { title: string; lines: string[]; claimed: boolean; disabled: boolean; onClaim: () => void; language: 'ru' | 'en' }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="font-bold text-white">{title}</div>
      <ul className="mt-2 min-h-12 space-y-1 text-xs text-white/60">
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
      <button disabled={disabled} onClick={onClaim} className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
        {translate(language, claimed ? 'common.claimed' : 'common.claim')}
      </button>
    </div>
  );
}
