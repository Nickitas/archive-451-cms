import type { Locale } from './config';

// Строки shared-компонентов (хедер, тема); бренд «Архив 451» не переводится
const sharedCopyRu = {
    nav: {
        library: 'Библиотека',
        admin: 'Админка',
    },
    themeToggle: 'Переключить тему',
    description: 'Личная библиотека: книги, заметки и рейтинги',
};

export type SharedCopy = typeof sharedCopyRu;

export const sharedCopy: Record<Locale, SharedCopy> = {
    ru: sharedCopyRu,
    en: {
        nav: {
            library: 'Library',
            admin: 'Admin',
        },
        themeToggle: 'Toggle theme',
        description: 'Personal library: books, notes and ratings',
    },
};
