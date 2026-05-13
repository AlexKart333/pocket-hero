import { en } from './en';
import { ru } from './ru';
import type { Language, TranslationDictionary } from '../types/i18n';

const dictionaries: Record<Language, TranslationDictionary> = { ru, en };

export function translate(language: Language, key: string, values?: Record<string, string | number>): string {
  const template = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
  if (!values) return template;
  return Object.entries(values).reduce((result, [name, value]) => result.split(`{${name}}`).join(String(value)), template);
}

export function pickLocalized<T extends { ru: string; en: string }>(value: T, language: Language): string {
  return value[language] ?? value.en;
}

export function detectDefaultLanguage(telegramLanguageCode?: string): Language {
  return telegramLanguageCode?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}
