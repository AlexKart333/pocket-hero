import { useMemo, useState } from 'react';
import { getItem } from '../data/items';
import { translate } from '../i18n';
import { rarityOrder } from '../lib/balance';
import { useGameStore } from '../store/gameStore';
import type { ItemType } from '../types/game';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';

const filters: Array<'all' | ItemType> = ['all', 'weapon', 'armor', 'pet', 'artifact', 'cosmetic'];

export function InventoryScreen() {
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const equipItem = useGameStore((state) => state.equipItem);
  const sellItem = useGameStore((state) => state.sellItem);
  const [filter, setFilter] = useState<'all' | ItemType>('all');

  const items = useMemo(() => {
    if (!player) return [];
    return [...player.inventory]
      .filter((item) => filter === 'all' || getItem(item.itemId)?.type === filter)
      .sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity] || b.level - a.level);
  }, [filter, player]);

  if (!player) return null;
  const equippedIds = new Set(Object.values(player.equipped));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">{translate(language, 'inventory.title')}</h1>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${filter === item ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
            {translate(language, `inventory.filter.${item}`)}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState title={translate(language, 'inventory.emptyTitle')} text={translate(language, 'inventory.emptyText')} icon="🎒" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.instanceId}
              item={item}
              language={language}
              equipped={equippedIds.has(item.instanceId)}
              onEquip={() => equipItem(item.instanceId)}
              onSell={() => sellItem(item.instanceId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
