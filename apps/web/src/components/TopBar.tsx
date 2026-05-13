import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translate } from '../i18n';
import { telegram } from '../lib/telegram';
import { useGameStore } from '../store/gameStore';
import { LanguageSwitch } from './LanguageSwitch';

export function TopBar() {
  const language = useGameStore((state) => state.language);
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-white">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/20 text-xl">⚔️</span>
          <span>{translate(language, 'app.name')}</span>
        </Link>
        <div className="flex items-center gap-2">
          {!telegram.isTelegram ? <span className="hidden rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/60 sm:inline">{translate(language, 'top.demoMode')}</span> : null}
          <LanguageSwitch />
          <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70">
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
