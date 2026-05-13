import { useGameStore } from '../store/gameStore';
import type { Language } from '../types/i18n';

export function LanguageSwitch() {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const options: Language[] = ['ru', 'en'];
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setLanguage(option)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${language === option ? 'bg-primary text-white' : 'text-white/60'}`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
