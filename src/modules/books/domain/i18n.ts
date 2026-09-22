import type { Locale } from '@/shared/i18n/config';
import type { BooksSort } from './book-filters';
import type { BookStatus } from './book';

// ru — источник правды: тип BooksCopy заставляет заполнить en полностью
const booksCopyRu = {
    meta: {
        library: 'Библиотека',
    },
    list: {
        title: 'Библиотека',
        showingPrefix: 'Показано',
        showingOf: 'из',
        viewGrid: 'Плитка',
        viewList: 'Список',
        toggleViewAria: 'Переключить вид',
        filtersButton: 'Фильтры',
        emptyTitle: 'Книги не найдены',
        emptyDescription: 'Добавьте первую книгу в админке или сбросьте активные фильтры.',
        resetFilters: 'Сбросить фильтры',
    },
    filters: {
        searchPlaceholder: 'Название или автор…',
        clearSearchAria: 'Очистить поиск',
        statusLabels: {
            want: 'Хочу прочитать',
            reading: 'Читаю',
            done: 'Прочитана',
        } as Record<BookStatus, string>,
        sortLabels: {
            'title-asc': 'Название А–Я',
            'rating-desc': 'Высокий рейтинг',
            'finished-desc': 'Недавно прочитанные',
            'added-desc': 'Недавно добавленные',
        } as Record<BooksSort, string>,
        ratingPlaceholder: 'Рейтинг',
        ratingAny: 'Любой рейтинг',
        ratingFrom: (rating: number) => `от ${rating} и выше`,
        sortPlaceholder: 'Сортировка',
        tagsLabel: 'Теги',
        reset: 'Сбросить',
    },
    pagination: {
        pageSizePrefix: 'Показывать',
        pageSizeSuffix: 'на странице',
        pageInfo: (page: number, totalPages: number) => `Страница ${page} из ${totalPages}`,
    },
    detail: {
        backToLibrary: 'Назад к библиотеке',
        openInYandex: 'Открыть в Яндекс.Книгах',
        notesSection: 'Заметки',
        notesEmpty: 'Заметок пока нет — добавьте первую через админку (коллекция «Notes»).',
    },
    note: {
        forms: { one: 'заметка', few: 'заметки', many: 'заметок' },
    },
};

export type BooksCopy = typeof booksCopyRu;

export const booksCopy: Record<Locale, BooksCopy> = {
    ru: booksCopyRu,
    en: {
        meta: {
            library: 'Library',
        },
        list: {
            title: 'Library',
            showingPrefix: 'Showing',
            showingOf: 'of',
            viewGrid: 'Grid',
            viewList: 'List',
            toggleViewAria: 'Toggle view',
            filtersButton: 'Filters',
            emptyTitle: 'No books found',
            emptyDescription: 'Add your first book in the admin or reset the active filters.',
            resetFilters: 'Reset filters',
        },
        filters: {
            searchPlaceholder: 'Title or author…',
            clearSearchAria: 'Clear search',
            statusLabels: {
                want: 'Want to read',
                reading: 'Reading',
                done: 'Finished',
            },
            sortLabels: {
                'title-asc': 'Title A–Z',
                'rating-desc': 'Highest rating',
                'finished-desc': 'Recently finished',
                'added-desc': 'Recently added',
            },
            ratingPlaceholder: 'Rating',
            ratingAny: 'Any rating',
            ratingFrom: (rating: number) => `from ${rating} and up`,
            sortPlaceholder: 'Sort',
            tagsLabel: 'Tags',
            reset: 'Reset',
        },
        pagination: {
            pageSizePrefix: 'Show',
            pageSizeSuffix: 'per page',
            pageInfo: (page: number, totalPages: number) => `Page ${page} of ${totalPages}`,
        },
        detail: {
            backToLibrary: 'Back to library',
            openInYandex: 'Open in Yandex Books',
            notesSection: 'Notes',
            notesEmpty: 'No notes yet — add the first one via the admin (the «Notes» collection).',
        },
        note: {
            forms: { one: 'note', few: 'notes', many: 'notes' },
        },
    },
};
