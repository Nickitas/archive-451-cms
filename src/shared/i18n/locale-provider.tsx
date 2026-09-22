'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { DEFAULT_LOCALE, type Locale } from './config';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

type LocaleProviderProps = {
    locale: Locale;
    children: ReactNode;
};

// Локаль с сервера для клиентских компонентов (формы, фильтры, меню)
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
    return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
    return useContext(LocaleContext);
}
