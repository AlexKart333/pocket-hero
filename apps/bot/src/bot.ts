import { Markup, Telegraf } from 'telegraf';
import { env } from './env.js';
import { insertPurchase } from './db.js';
import { getPaymentProduct, parsePaymentPayload } from './payments.js';

export const bot = new Telegraf(env.BOT_TOKEN);

bot.start(async (ctx) => {
  const language = ctx.from?.language_code?.startsWith('ru') ? 'ru' : 'en';
  const text = language === 'ru'
    ? 'Добро пожаловать в PocketHero! Создайте героя, проходите короткие приключения и собирайте сезонные награды.'
    : 'Welcome to PocketHero! Create a hero, clear short adventures and collect seasonal rewards.';
  const button = language === 'ru' ? 'Открыть PocketHero' : 'Open PocketHero';
  await ctx.reply(text, Markup.inlineKeyboard([Markup.button.webApp(button, env.WEB_APP_URL)]));
});

bot.command('paysupport', async (ctx) => {
  const language = ctx.from?.language_code?.startsWith('ru') ? 'ru' : 'en';
  const text = language === 'ru'
    ? 'Напишите нам описание проблемы с платежом. Укажите дату, товар и ваш Telegram username.'
    : 'Send us a description of your payment issue. Include the date, product and your Telegram username.';
  await ctx.reply(text);
});

bot.on('pre_checkout_query', async (ctx) => {
  try {
    const payload = parsePaymentPayload(ctx.preCheckoutQuery.invoice_payload);
    const product = getPaymentProduct(payload.productId);
    if (!product || payload.userId !== ctx.from.id) {
      await ctx.answerPreCheckoutQuery(false, 'Invalid payment payload');
      return;
    }
    await ctx.answerPreCheckoutQuery(true);
  } catch {
    await ctx.answerPreCheckoutQuery(false, 'Invalid payment payload');
  }
});

bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;
  try {
    const payload = parsePaymentPayload(payment.invoice_payload);
    insertPurchase({
      userId: payload.userId,
      productId: payload.productId,
      payload: payment.invoice_payload,
      chargeId: payment.telegram_payment_charge_id
    });
    const language = ctx.from?.language_code?.startsWith('ru') ? 'ru' : 'en';
    await ctx.reply(language === 'ru' ? 'Покупка успешна! Откройте PocketHero, чтобы получить награду.' : 'Purchase successful! Open PocketHero to receive your reward.');
  } catch {
    await ctx.reply('Payment received, but delivery needs manual support. Send /paysupport.');
  }
});
