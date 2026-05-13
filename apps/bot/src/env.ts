import dotenv from 'dotenv';

dotenv.config();

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing required env: ${name}`);
  return value;
}

export const env = {
  BOT_TOKEN: readEnv('BOT_TOKEN', process.env.NODE_ENV === 'production' ? undefined : 'dev-token'),
  WEB_APP_URL: readEnv('WEB_APP_URL', 'https://your-domain.com'),
  API_PORT: Number(readEnv('API_PORT', '8787')),
  NODE_ENV: readEnv('NODE_ENV', 'development'),
  DATABASE_PATH: readEnv('DATABASE_PATH', './pockethero.sqlite'),
  CORS_ORIGIN: readEnv('CORS_ORIGIN', 'http://localhost:5173')
};
