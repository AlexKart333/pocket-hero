import { getHeroClass } from '../data/classes';
import { getItem } from '../data/items';
import type { PlayerState } from '../types/game';

interface HeroAvatarProps {
  player: PlayerState;
  size?: 'sm' | 'lg';
}

export function HeroAvatar({ player, size = 'lg' }: HeroAvatarProps) {
  const heroClass = getHeroClass(player.hero.classId);
  const cosmetic = player.equipped.cosmetic ? player.inventory.find((item) => item.instanceId === player.equipped.cosmetic) : undefined;
  const cosmeticIcon = cosmetic ? getItem(cosmetic.itemId)?.icon : undefined;
  const dimension = size === 'lg' ? 'h-20 w-20 text-4xl' : 'h-12 w-12 text-2xl';
  return (
    <div className={`${dimension} relative grid place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-primary/40 to-accent/20 shadow-glow`}>
      <span>{heroClass.icon}</span>
      {cosmeticIcon ? <span className="absolute -right-1 -top-1 rounded-full bg-card px-1 text-base">{cosmeticIcon}</span> : null}
    </div>
  );
}
