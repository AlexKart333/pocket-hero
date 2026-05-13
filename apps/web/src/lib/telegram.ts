import type { TelegramWebApp, TelegramWebAppUser } from '../types/telegram';

export interface TelegramAdapter {
  isTelegram: boolean;
  webApp?: TelegramWebApp;
  platform: string;
  initData: string;
  user: TelegramWebAppUser;
  ready: () => void;
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy') => void;
    notification: (type?: 'success' | 'error' | 'warning') => void;
    selection: () => void;
  };
  share: (text: string) => Promise<'telegram' | 'clipboard'>;
  openInvoice: (invoiceLink: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
}

const mockUser: TelegramWebAppUser = {
  id: 100001,
  username: 'demo_hero',
  first_name: 'Demo',
  last_name: 'Hero',
  language_code: 'ru'
};

function getWebApp(): TelegramWebApp | undefined {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
}

function applyThemeVariables(webApp?: TelegramWebApp): void {
  const root = document.documentElement;
  const theme = webApp?.themeParams;
  root.style.setProperty('--tg-theme-bg-color', theme?.bg_color ?? '#0f1020');
  root.style.setProperty('--tg-theme-text-color', theme?.text_color ?? '#f8fafc');
  root.style.setProperty('--tg-theme-hint-color', theme?.hint_color ?? '#94a3b8');
  root.style.setProperty('--tg-theme-button-color', theme?.button_color ?? '#7c3aed');
  root.style.setProperty('--tg-theme-button-text-color', theme?.button_text_color ?? '#ffffff');
  root.style.setProperty('--tg-theme-secondary-bg-color', theme?.secondary_bg_color ?? '#17182d');
}

export function createTelegramAdapter(): TelegramAdapter {
  const webApp = getWebApp();
  const isTelegram = Boolean(webApp?.initDataUnsafe?.user);
  const user = webApp?.initDataUnsafe?.user ?? mockUser;
  applyThemeVariables(webApp);

  const ready = (): void => {
    try {
      webApp?.ready();
      webApp?.expand();
      webApp?.requestFullscreen?.();
      applyThemeVariables(webApp);
    } catch {
      // Telegram clients differ by platform; unsupported calls should not break the app.
    }
  };

  return {
    isTelegram,
    webApp,
    platform: webApp?.platform ?? 'browser',
    initData: webApp?.initData ?? '',
    user,
    ready,
    haptic: {
      impact: (style = 'light') => webApp?.HapticFeedback?.impactOccurred(style),
      notification: (type = 'success') => webApp?.HapticFeedback?.notificationOccurred(type),
      selection: () => webApp?.HapticFeedback?.selectionChanged()
    },
    share: async (text: string) => {
      const url = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
      if (webApp?.openTelegramLink) {
        webApp.openTelegramLink(url);
        return 'telegram';
      }
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      return 'clipboard';
    },
    openInvoice: (invoiceLink, callback) => {
      if (webApp?.openInvoice) {
        webApp.openInvoice(invoiceLink, callback);
      } else {
        window.open(invoiceLink, '_blank', 'noopener,noreferrer');
        callback?.('pending');
      }
    }
  };
}

export const telegram = createTelegramAdapter();
