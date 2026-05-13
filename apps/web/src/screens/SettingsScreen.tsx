import { translate } from '../i18n';
import { telegram } from '../lib/telegram';
import { useGameStore } from '../store/gameStore';
import type { ThemeMode } from '../types/game';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { PrimaryButton } from '../components/PrimaryButton';

const themes: ThemeMode[] = ['telegram', 'dark', 'light'];

export function SettingsScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const setTheme = useGameStore((state) => state.setTheme);
  const resetProgress = useGameStore((state) => state.resetProgress);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">{translate(language, 'settings.title')}</h1>
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <h2 className="mb-3 font-bold text-white">{translate(language, 'settings.language')}</h2>
        <LanguageSwitch />
      </section>
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <h2 className="mb-3 font-bold text-white">{translate(language, 'settings.theme')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((theme) => (
            <button key={theme} onClick={() => setTheme(theme)} className={`rounded-2xl px-3 py-2 text-xs font-bold ${player?.settings.theme === theme ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
              {translate(language, `settings.theme.${theme}`)}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <h2 className="mb-3 font-bold text-white">{translate(language, 'settings.telegramStatus')}</h2>
        <div className="space-y-2 text-sm text-white/65">
          <Row label={translate(language, 'settings.telegramStatus')} value={translate(language, telegram.isTelegram ? 'settings.insideTelegram' : 'settings.browserDemo')} />
          <Row label={translate(language, 'settings.platform')} value={telegram.platform} />
          <Row label={translate(language, 'settings.userId')} value={String(telegram.user.id)} />
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
        <Row label={translate(language, 'settings.version')} value="0.1.0" />
        <p className="mt-3 text-sm text-white/60">{translate(language, 'settings.paySupport')}</p>
      </section>
      <PrimaryButton variant="danger" onClick={resetProgress}>{translate(language, 'settings.reset')}</PrimaryButton>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span>{label}</span><span className="truncate text-white">{value}</span></div>;
}
