import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERO_CLASSES } from '../data/classes';
import { getItem } from '../data/items';
import { pickLocalized, translate } from '../i18n';
import { useGameStore } from '../store/gameStore';
import type { ClassId } from '../types/game';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { PrimaryButton } from '../components/PrimaryButton';

export function OnboardingScreen() {
  const language = useGameStore((state) => state.language);
  const createHero = useGameStore((state) => state.createHero);
  const [classId, setClassId] = useState<ClassId>('warrior');
  const [heroName, setHeroName] = useState('');
  const navigate = useNavigate();
  const selected = HERO_CLASSES.find((heroClass) => heroClass.id === classId) ?? HERO_CLASSES[0];
  const starter = getItem(selected.starterItemId);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-2xl font-black text-white"><span>⚔️</span>{translate(language, 'app.name')}</div>
        <LanguageSwitch />
      </div>
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-3xl border border-white/10 bg-card/90 p-5 shadow-glow">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary/20 text-5xl">{selected.icon}</div>
          <h1 className="mt-4 text-3xl font-black text-white">{translate(language, 'app.name')}</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">{translate(language, 'onboarding.pitch')}</p>
        </div>
        <label className="mt-5 block text-sm font-semibold text-white/70">
          {translate(language, 'onboarding.heroName')}
          <input
            value={heroName}
            onChange={(event) => setHeroName(event.target.value)}
            placeholder={translate(language, 'onboarding.defaultHeroName')}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary"
          />
        </label>
        <h2 className="mt-6 font-bold text-white">{translate(language, 'onboarding.chooseClass')}</h2>
        <div className="mt-3 space-y-3">
          {HERO_CLASSES.map((heroClass) => (
            <button
              key={heroClass.id}
              onClick={() => setClassId(heroClass.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${classId === heroClass.id ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{heroClass.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{pickLocalized(heroClass.name, language)}</div>
                  <div className="text-xs text-white/60">{pickLocalized(heroClass.description, language)}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-white/70">
                <span>{translate(language, 'common.hp')} {heroClass.baseStats.hp}</span>
                <span>{translate(language, 'common.attack')} {heroClass.baseStats.attack}</span>
                <span>{translate(language, 'common.defense')} {heroClass.baseStats.defense}</span>
                <span>{translate(language, 'common.speed')} {heroClass.baseStats.speed}</span>
              </div>
            </button>
          ))}
        </div>
        {starter ? (
          <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm text-white/70">
            {translate(language, 'onboarding.startItem')}: {starter.icon} {pickLocalized(starter.name, language)}
          </div>
        ) : null}
        <PrimaryButton className="mt-5" onClick={() => { createHero(classId, heroName || translate(language, 'onboarding.defaultHeroName')); navigate('/'); }}>
          {translate(language, 'onboarding.createHero')}
        </PrimaryButton>
      </motion.section>
    </main>
  );
}
