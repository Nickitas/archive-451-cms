import type { Locale } from './config';

const DATE_LOCALES: Record<Locale, string> = { ru: 'ru-RU', en: 'en-US' };

// Дата в локали фронта (контент не переводится, только формат)
export function formatDate(locale: Locale, date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    return new Date(date).toLocaleDateString(DATE_LOCALES[locale], options);
}

type PluralForms = { one: string; few: string; many: string };

// Форма множественного числа: для ru — 1/2–4/5+, для en — 1/остальные
export function pluralForm(locale: Locale, count: number, forms: PluralForms): string {
    if (locale === 'en') {
        return count === 1 ? forms.one : forms.many;
    }

    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return forms.one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return forms.few;
    }
    return forms.many;
}
