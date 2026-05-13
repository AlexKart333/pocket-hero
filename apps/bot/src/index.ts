import cors from 'cors';
import express from 'express';
import { bot } from './bot.js';
import { env } from './env.js';
import { routes } from './routes.js';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(routes);

app.listen(env.API_PORT, () => {
  console.log(`PocketHero API listening on http://localhost:${env.API_PORT}`);
});

if (env.NODE_ENV !== 'production' && env.BOT_TOKEN !== 'dev-token') {
  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('PocketHero bot polling started'))
    .catch((error) => console.error('Bot polling failed', error));
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
