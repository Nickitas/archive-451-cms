import { cookies } from 'next/headers';

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';

// Локаль фронта из cookie; только на сервере (layout, страницы, экшены)
export async function getLocale(): Promise<Locale> {
    const value = (await cookies()).get(LOCALE_COOKIE)?.value;

    return value !== undefined && isLocale(value) ? value : DEFAULT_LOCALE;
}
