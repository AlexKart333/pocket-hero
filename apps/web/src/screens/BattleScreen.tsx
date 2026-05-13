import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { translate, pickLocalized } from '../i18n';
import { getHeroClass } from '../data/classes';
import { getEnemy } from '../data/enemies';
import { useGameStore } from '../store/gameStore';
import type { BattleAction } from '../types/game';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';

export function BattleScreen() {
  const battle = useGameStore((state) => state.currentBattle);
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const battleAction = useGameStore((state) => state.battleAction);
  const navigate = useNavigate();

  if (!battle || !player) {
    return <EmptyState title={translate(language, 'battle.noBattleTitle')} text={translate(language, 'battle.noBattleText')} action={<PrimaryButton onClick={() => navigate('/')}>{translate(language, 'common.home')}</PrimaryButton>} />;
  }

  const heroClass = getHeroClass(player.hero.classId);
  const actions: BattleAction[] = ['attack', 'skill', 'defend', 'potion'];
  const handleAction = (action: BattleAction) => {
    const outcome = battleAction(action);
    if (outcome === 'adventure') navigate('/adventure');
    if (outcome === 'result') navigate('/result');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{translate(language, 'battle.title')}</h1>
            <p className="text-sm text-white/60">{translate(language, 'battle.turn', { turn: battle.turn })}</p>
          </div>
          <span className="rounded-3xl bg-danger/20 px-4 py-3 text-4xl">{battle.enemy.icon}</span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl border border-white/10 bg-card/90 p-4">
          <div className="text-3xl">{heroClass.icon}</div>
          <div className="mt-2 font-bold text-white">{player.hero.name}</div>
          <ProgressBar value={(battle.heroHp / battle.heroStats.hp) * 100} label={`${translate(language, 'common.hp')} ${battle.heroHp}/${battle.heroStats.hp}`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl border border-white/10 bg-card/90 p-4">
          <div className="text-3xl">{battle.enemy.icon}</div>
          <div className="mt-2 font-bold text-white">{pickLocalized(battle.enemy.name, language)}</div>
          <ProgressBar value={(battle.enemyHp / battle.enemy.hp) * 100} label={`${translate(language, 'common.hp')} ${battle.enemyHp}/${battle.enemy.hp}`} />
        </motion.div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <PrimaryButton key={action} variant={action === 'potion' && battle.potionUsed ? 'secondary' : action === 'defend' ? 'secondary' : 'primary'} disabled={action === 'potion' && battle.potionUsed} onClick={() => handleAction(action)}>
            {action === 'skill' ? pickLocalized(heroClass.skillName, language) : translate(language, `battle.${action}`)}
          </PrimaryButton>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <h2 className="mb-3 font-bold text-white">{translate(language, 'battle.title')}</h2>
        <div className="space-y-2">
          {battle.log.length === 0 ? <p className="text-sm text-white/50">{pickLocalized(heroClass.skillDescription, language)}</p> : null}
          {battle.log.map((entry, index) => (
            <div key={`${entry.key}-${index}`} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/70">
              {translate(language, entry.key, localizeBattleValues(entry.values, language))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function localizeBattleValues(values: Record<string, string | number> | undefined, language: 'ru' | 'en'): Record<string, string | number> | undefined {
  if (!values) return values;
  const enemyId = typeof values.enemy === 'string' ? values.enemy : undefined;
  const enemy = enemyId ? getEnemy(enemyId) : undefined;
  return { ...values, enemy: enemy ? pickLocalized(enemy.name, language) : values.enemy };
}
