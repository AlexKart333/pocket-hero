import { Backpack, Home, Shield, ShoppingBag, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { translate } from '../i18n';
import { useGameStore } from '../store/gameStore';

const links = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/hero', key: 'nav.hero', icon: Shield },
  { to: '/inventory', key: 'nav.inventory', icon: Backpack },
  { to: '/season', key: 'nav.season', icon: Trophy },
  { to: '/shop', key: 'nav.shop', icon: ShoppingBag }
];

export function BottomNav() {
  const language = useGameStore((state) => state.language);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-bg/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${isActive ? 'bg-primary/20 text-white' : 'text-white/50'}`}
            >
              <Icon size={19} />
              <span>{translate(language, link.key)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
