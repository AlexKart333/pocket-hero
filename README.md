# PocketHero

PocketHero is a Telegram Mini App MVP: a single-player bilingual RPG with daily adventures, streaks, idle rewards, loot, daily/weekly quests, season progress and Telegram Stars payment preparation. It is not tap-to-earn, does not use crypto tokens and does not promise earnings.

## Tech stack

- Monorepo with npm workspaces
- Web: Vite, React, TypeScript, Tailwind CSS, React Router, Zustand, lucide-react, Framer Motion
- Telegram integration through `window.Telegram.WebApp` with a browser-safe mock adapter
- Bot/API: Node.js, TypeScript, Express, Telegraf, better-sqlite3, dotenv, cors

## Install

```bash
npm install
```

## Run frontend only

```bash
npm run dev:web
```

Open `http://localhost:5173`. Outside Telegram the app runs in mock mode with demo user `demo_hero` and Russian default language.

## Run bot/API

Copy env values:

```bash
cp .env.example .env
```

Then set `BOT_TOKEN` for a real bot if you want polling and Stars invoices.

```bash
npm run dev:bot
```

Healthcheck:

```bash
curl http://localhost:8787/health
```

## Run everything

```bash
npm run dev
```

## Build and typecheck

```bash
npm run build
npm run typecheck
```

## Create a Telegram bot and Mini App

1. Open BotFather in Telegram.
2. Run `/newbot` and save the token into `BOT_TOKEN`.
3. Deploy the web app to an HTTPS URL.
4. Set `WEB_APP_URL=https://your-domain.com`.
5. In BotFather, configure the bot menu button or Mini App button with the HTTPS URL.
6. Start the bot with `/start` and use the “Open PocketHero” button.

## Required env

```bash
BOT_TOKEN=
WEB_APP_URL=https://your-domain.com
API_PORT=8787
NODE_ENV=development
DATABASE_PATH=./pockethero.sqlite
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE=http://localhost:8787
VITE_DEMO_PAYMENTS=true
```

## Demo mode

The frontend works without backend. When Telegram WebApp API is missing, `src/lib/telegram.ts` provides mock data:

- user id: `100001`
- username: `demo_hero`
- language_code: `ru`

Local game progress is stored in `localStorage` under `pocketHeroState_v1`. Demo payments are enabled when Telegram is unavailable or `VITE_DEMO_PAYMENTS=true`; purchases are applied immediately and marked as demo purchases.

## Localization

The UI uses flat dictionaries in:

- `apps/web/src/i18n/ru.ts`
- `apps/web/src/i18n/en.ts`

Game data such as classes, items, enemies, quests and shop products store localized names and descriptions as `{ ru, en }`. The default language is Russian when Telegram `user.language_code` starts with `ru`; otherwise it is English. A selected language is stored in `localStorage`.

## Game logic

Core formulas and state transitions live in `apps/web/src/lib/gameEngine.ts`:

- energy max is 5;
- 1 energy restores every 30 minutes;
- idle reward is available every 4 hours;
- daily streak updates on calendar-day visits;
- adventure runs have 3 rooms;
- battles are turn-based with class skills;
- loot is deterministic with a seedable RNG helper;
- daily and weekly quests update through game events;
- season rewards unlock by season points.

The game is playable without payments. Paid products do not grant random combat loot, direct wins or crypto assets.

## Payments and Telegram Stars

The API endpoint `POST /api/create-invoice` validates Telegram initData, finds the product config and calls Telegram Bot API `createInvoiceLink` with:

- `currency: XTR`
- empty `provider_token`
- Stars prices
- JSON payload with `userId`, `productId`, `timestamp`

The bot handles:

- `pre_checkout_query`
- `successful_payment`

Successful purchases are saved to SQLite as undelivered. The frontend can fetch undelivered purchases and apply them during sync.

For payment support, users can send `/paysupport` to the bot.

## Production checklist

Before production:

1. Deploy the web app to HTTPS.
2. Set `WEB_APP_URL` to the deployed URL.
3. Set a real `BOT_TOKEN`.
4. Set `CORS_ORIGIN` to the HTTPS web app origin.
5. Verify Telegram initData validation with real Telegram clients.
6. Set `VITE_DEMO_PAYMENTS=false`.
7. Keep SQLite on persistent storage or replace it with managed DB.
8. Add privacy policy and support contact.
9. Test Stars payments end-to-end.
10. Review balance and economy for retention and fairness.
