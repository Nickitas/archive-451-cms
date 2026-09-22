'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { LOCALE_COOKIE, isLocale, type Locale } from '@/shared/i18n/config';

// Переключение языка фронта: cookie + полная ревалидация layout'а
export async function setLocaleAction(formData: FormData): Promise<void> {
    const locale = String(formData.get('locale') ?? '');

    if (!isLocale(locale)) {
        return;
    }

    (await cookies()).set(LOCALE_COOKIE, locale satisfies Locale, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
    });

    revalidatePath('/', 'layout');
}
