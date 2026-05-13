import { SHOP_PRODUCTS } from '../data/shop';
import { pickLocalized, translate } from '../i18n';
import { demoPaymentsEnabled } from '../lib/api';
import { useGameStore } from '../store/gameStore';
import { PrimaryButton } from '../components/PrimaryButton';

export function ShopScreen() {
  const language = useGameStore((state) => state.language);
  const buyProduct = useGameStore((state) => state.buyProduct);
  const isDemo = demoPaymentsEnabled();

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-card/90 p-5 shadow-glow">
        <h1 className="text-2xl font-black text-white">{translate(language, 'shop.title')}</h1>
        <p className="mt-2 text-sm text-white/60">{translate(language, 'shop.noPaidPower')}</p>
      </section>
      <section className="space-y-3">
        {SHOP_PRODUCTS.map((product) => (
          <div key={product.id} className="rounded-3xl border border-white/10 bg-card/90 p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl">{product.icon}</div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-white">{pickLocalized(product.name, language)}</h2>
                <p className="mt-1 text-sm text-white/60">{pickLocalized(product.description, language)}</p>
                <div className="mt-3"><PrimaryButton onClick={() => buyProduct(product.id)}>{isDemo ? translate(language, 'shop.demoPurchase') : translate(language, 'shop.buyForStars', { stars: product.priceStars })}</PrimaryButton></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
