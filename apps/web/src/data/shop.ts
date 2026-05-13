import type { ShopProduct } from '../types/game';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'premium_pass', icon: '🎟️', priceStars: 199,
    name: { ru: 'Premium Season Pass', en: 'Premium Season Pass' },
    description: { ru: 'Открывает premium-награды сезона без боевого преимущества.', en: 'Unlocks premium season rewards without combat advantage.' }
  },
  {
    id: 'energy_pack', icon: '⚡', priceStars: 49,
    name: { ru: 'Набор энергии', en: 'Energy Pack' },
    description: { ru: 'Добавляет энергию для дополнительных приключений.', en: 'Adds energy for extra adventures.' }
  },
  {
    id: 'cosmetic_chest', icon: '🎨', priceStars: 99,
    name: { ru: 'Косметический сундук', en: 'Cosmetic Chest' },
    description: { ru: 'Даёт только косметический предмет. Без боевого лута.', en: 'Grants a cosmetic item only. No combat loot.' }
  },
  {
    id: 'starter_bundle', icon: '🎁', priceStars: 149,
    name: { ru: 'Стартовый набор', en: 'Starter Bundle' },
    description: { ru: 'Золото, энергия и косметика. Без легендарного оружия.', en: 'Gold, energy and a cosmetic. No legendary weapon.' }
  }
];

export function getProduct(productId: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((product) => product.id === productId);
}
