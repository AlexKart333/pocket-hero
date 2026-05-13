import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pickLocalized, translate } from '../i18n';
import { getItem } from '../data/items';
import { getEnemy } from '../data/enemies';
import { useGameStore } from '../store/gameStore';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';

export function AdventureScreen() {
  const run = useGameStore((state) => state.currentRun);
  const language = useGameStore((state) => state.language);
  const chooseRoomOption = useGameStore((state) => state.chooseRoomOption);
  const navigate = useNavigate();

  if (!run) {
    return <EmptyState title={translate(language, 'adventure.noRunTitle')} text={translate(language, 'adventure.noRunText')} action={<PrimaryButton onClick={() => navigate('/')}>{translate(language, 'adventure.goHome')}</PrimaryButton>} />;
  }

  const onChoose = (choiceId: string) => {
    const outcome = chooseRoomOption(choiceId);
    if (outcome === 'battle') navigate('/battle');
    if (outcome === 'finished') navigate('/result');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-glow">
        <h1 className="text-2xl font-black text-white">{translate(language, 'adventure.title')}</h1>
        <p className="text-sm text-white/60">{translate(language, 'adventure.room', { step: run.step, max: run.maxSteps })}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: run.maxSteps }, (_, index) => (
            <div key={index} className={`h-2 rounded-full ${index + 1 <= run.step ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </section>

      {run.roomLog.length ? (
        <section className="space-y-2">
          {run.roomLog.slice(-2).map((entry, index) => (
            <div key={`${entry.step}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
              {translate(language, entry.messageKey, localizeLogValues(entry.values, language))}
            </div>
          ))}
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-bold text-white">{translate(language, 'adventure.choosePath')}</h2>
        <div className="space-y-3">
          {run.currentRoom.options.map((option, index) => {
            const enemy = option.enemyId ? getEnemy(option.enemyId) : undefined;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => onChoose(option.id)}
                className="w-full rounded-3xl border border-white/10 bg-card/90 p-4 text-left shadow-lg transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white">{translate(language, option.labelKey)}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/60">{translate(language, option.descriptionKey)}</p>
                    {enemy ? <p className="mt-2 text-xs text-accent">{enemy.icon} {pickLocalized(enemy.name, language)}</p> : null}
                  </div>
                  <span className="rounded-2xl bg-white/10 px-3 py-2 text-xl">{iconForOption(option.type)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                  <span>{translate(language, 'adventure.risk', { risk: option.risk })}</span>
                  <span>{translate(language, 'adventure.rewardHint', { reward: translate(language, option.rewardKey) })}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function iconForOption(type: string): string {
  return type === 'monster' ? '👹' : type === 'treasure' ? '🎁' : type === 'shrine' ? '✨' : type === 'trader' ? '🧙' : '🌫️';
}

function localizeLogValues(values: Record<string, string | number> | undefined, language: 'ru' | 'en'): Record<string, string | number> | undefined {
  if (!values) return values;
  const itemId = typeof values.item === 'string' ? values.item : undefined;
  const enemyId = typeof values.enemy === 'string' ? values.enemy : undefined;
  const item = itemId ? getItem(itemId) : undefined;
  const enemy = enemyId ? getEnemy(enemyId) : undefined;
  return { ...values, item: item ? pickLocalized(item.name, language) : values.item, enemy: enemy ? pickLocalized(enemy.name, language) : values.enemy };
}
