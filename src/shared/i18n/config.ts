// Доступные локали фронта; словари пишутся с ru как источника правды
export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_COOKIE = 'app-locale';

// Названия языков в переключателе — каждое на своём языке
export const LOCALE_LABELS: Record<Locale, string> = {
    ru: 'Русский',
    en: 'English',
};

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}
