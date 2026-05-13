import { useNavigate } from 'react-router-dom';
import { getItem } from '../data/items';
import { pickLocalized, translate } from '../i18n';
import { telegram } from '../lib/telegram';
import { useGameStore } from '../store/gameStore';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';

export function ResultScreen() {
  const result = useGameStore((state) => state.lastResult);
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const startAdventure = useGameStore((state) => state.startAdventure);
  const showToast = useGameStore((state) => state.showToast);
  const navigate = useNavigate();

  if (!result || !player) {
    return <EmptyState title={translate(language, 'result.noResultTitle')} text={translate(language, 'result.noResultText')} action={<PrimaryButton onClick={() => navigate('/')}>{translate(language, 'common.home')}</PrimaryButton>} />;
  }

  const firstItem = result.items[0] ? getItem(result.items[0].itemId) : undefined;
  const shareText = firstItem
    ? translate(language, 'result.shareDungeon', { itemName: pickLocalized(firstItem.name, language) })
    : translate(language, 'result.shareDungeonFallback');

  const runAgain = () => {
    if (startAdventure()) navigate('/adventure');
  };

  const share = async () => {
    await telegram.share(shareText);
    showToast({ key: 'result.shareCopied', type: 'success' });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-5 text-center shadow-glow">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-4xl">{result.victory ? '🏆' : '🛡️'}</div>
        <h1 className="mt-4 text-2xl font-black text-white">{translate(language, result.victory ? 'result.victoryTitle' : 'result.lossTitle')}</h1>
        <p className="mt-2 text-sm text-white/60">{translate(language, result.victory ? 'result.victoryText' : 'result.lossText')}</p>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={translate(language, 'common.xp')} value={result.xp} />
        <StatCard label={translate(language, 'common.gold')} value={result.gold} />
        <StatCard label={translate(language, 'common.sparks')} value={result.sparks} />
        <StatCard label={translate(language, 'common.sp')} value={result.seasonPoints} />
      </div>
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 text-sm text-white/65">
        <p>{translate(language, 'result.healthRestored')}</p>
        {result.lostSparks > 0 ? <p className="mt-2 text-danger">{translate(language, 'result.sparksLost', { sparks: result.lostSparks })}</p> : null}
      </section>
      <section className="space-y-3">
        {result.items.map((item) => <ItemCard key={item.instanceId} item={item} language={language} />)}
      </section>
      <div className="grid grid-cols-1 gap-3">
        <PrimaryButton onClick={share}>{translate(language, 'result.share')}</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => navigate('/')}>{translate(language, 'common.home')}</PrimaryButton>
        <PrimaryButton variant="secondary" disabled={player.energy.current <= 0} onClick={runAgain}>{translate(language, 'result.runAgain')}</PrimaryButton>
      </div>
    </div>
  );
}
