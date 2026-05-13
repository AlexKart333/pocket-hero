import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { translate } from './i18n';
import { useGameStore } from './store/gameStore';
import { Layout } from './components/Layout';
import { AdventureScreen } from './screens/AdventureScreen';
import { BattleScreen } from './screens/BattleScreen';
import { HeroScreen } from './screens/HeroScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SeasonScreen } from './screens/SeasonScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';

function RequireHero({ children }: { children: JSX.Element }) {
  const player = useGameStore((state) => state.player);
  return player ? children : <Navigate to="/onboarding" replace />;
}

export function App() {
  const initApp = useGameStore((state) => state.initApp);
  const isHydrated = useGameStore((state) => state.isHydrated);
  const language = useGameStore((state) => state.language);
  const player = useGameStore((state) => state.player);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.body.dataset.theme = player?.settings.theme ?? 'telegram';
  }, [language, player?.settings.theme]);

  if (!isHydrated) {
    return <div className="grid min-h-screen place-items-center text-white/70">{translate(language, 'common.loading')}</div>;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={player ? <Navigate to="/" replace /> : <OnboardingScreen />} />
      <Route element={<RequireHero><Layout /></RequireHero>}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/adventure" element={<AdventureScreen />} />
        <Route path="/battle" element={<BattleScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/hero" element={<HeroScreen />} />
        <Route path="/season" element={<SeasonScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to={player ? '/' : '/onboarding'} replace />} />
    </Routes>
  );
}
