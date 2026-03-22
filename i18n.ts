import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh', 'fr', 'es', 'de', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
};

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  const messages = (await import(`./messages/${validLocale}.json`)).default;

  let finalMessages = messages;
  if (validLocale !== defaultLocale) {
    try {
      const fallback = (await import(`./messages/${defaultLocale}.json`)).default;
      finalMessages = { ...fallback, ...messages };
    } catch {}
  }

  return { locale: validLocale, messages: finalMessages };
});
