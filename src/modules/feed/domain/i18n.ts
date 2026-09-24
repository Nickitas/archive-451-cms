import type { Locale } from '@/shared/i18n/config';

// ru — источник правды: тип FeedCopy заставляет заполнить en полностью
const feedCopyRu = {
    meta: {
        feed: 'Лента',
    },
    title: 'Лента заметок',
    subtitle: 'Свежие заметки из публичных книг всех читателей архива',
    emptyTitle: 'Пока тихо',
    emptyDescription: 'Заметки появятся здесь, когда книги станут публичными.',
};

export type FeedCopy = typeof feedCopyRu;

export const feedCopy: Record<Locale, FeedCopy> = {
    ru: feedCopyRu,
    en: {
        meta: {
            feed: 'Feed',
        },
        title: 'Notes feed',
        subtitle: 'Fresh notes from public books of all archive readers',
        emptyTitle: 'All quiet',
        emptyDescription: 'Notes will appear here once books become public.',
    },
};
