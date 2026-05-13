import { getItem } from '../data/items';
import { pickLocalized, translate } from '../i18n';
import { rarityClass } from '../lib/balance';
import type { InventoryItem } from '../types/game';
import type { Language } from '../types/i18n';
import { PrimaryButton } from './PrimaryButton';

interface ItemCardProps {
  item: InventoryItem;
  language: Language;
  equipped?: boolean;
  onEquip?: () => void;
  onSell?: () => void;
}

export function ItemCard({ item, language, equipped = false, onEquip, onSell }: ItemCardProps) {
  const definition = getItem(item.itemId);
  if (!definition) return null;
  const stats = Object.entries(definition.bonuses)
    .map(([key, value]) => `${key === 'critChance' ? 'crit' : key} ${Number(value) > 0 ? '+' : ''}${key === 'critChance' ? `${Math.round(Number(value) * 100)}%` : value}`)
    .join(' · ');
  return (
    <div className={`rounded-2xl border p-4 shadow-lg ${rarityClass[item.rarity]}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/20 text-2xl">{definition.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white">{pickLocalized(definition.name, language)}</h3>
            <span className="rounded-full bg-black/20 px-2 py-1 text-[10px] font-bold uppercase">{translate(language, `rarity.${item.rarity}`)}</span>
          </div>
          <p className="mt-1 text-xs text-white/65">{pickLocalized(definition.description, language)}</p>
          {stats ? <p className="mt-2 text-xs font-semibold text-white/80">{stats}</p> : null}
          <div className="mt-3 flex gap-2">
            {onEquip ? <PrimaryButton full={false} variant={equipped ? 'secondary' : 'primary'} className="px-3 py-2 text-xs" onClick={onEquip}>{translate(language, equipped ? 'inventory.unequip' : 'inventory.equip')}</PrimaryButton> : null}
            {onSell ? <PrimaryButton full={false} variant="ghost" className="px-3 py-2 text-xs" onClick={onSell}>{translate(language, 'inventory.sellValue', { gold: definition.sellPrice })}</PrimaryButton> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
