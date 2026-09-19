import { BOOK_STATUS_ORDER, type Book, type BookStatus } from './book';

export { BOOK_STATUS_ORDER };

export const MAX_RATING = 10;

export const PAGE_SIZES = [12, 24, 48];

export type BooksViewMode = 'grid' | 'list';

export type BooksSort = 'title-asc' | 'rating-desc' | 'finished-desc' | 'added-desc';

export const BOOKS_SORT_OPTIONS: { value: BooksSort; label: string }[] = [
    { value: 'title-asc', label: 'Название А–Я' },
    { value: 'rating-desc', label: 'Высокий рейтинг' },
    { value: 'finished-desc', label: 'Недавно прочитанные' },
    { value: 'added-desc', label: 'Недавно добавленные' },
];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    want: 'Хочу прочитать',
    reading: 'Читаю',
    done: 'Прочитана',
};

export type BooksFilters = {
    search: string;
    statuses: BookStatus[];
    selectedTags: string[];
    minRating: number;
    sort: BooksSort;
};

export const DEFAULT_BOOKS_FILTERS: BooksFilters = {
    search: '',
    statuses: [],
    selectedTags: [],
    minRating: 0,
    sort: 'title-asc',
};

const SORTERS: Record<BooksSort, (a: Book, b: Book) => number> = {
    'title-asc': (a, b) => a.title.localeCompare(b.title),
    'rating-desc': (a, b) => b.rating - a.rating,
    'finished-desc': (a, b) => dateValue(b.finishedAt) - dateValue(a.finishedAt),
    'added-desc': (a, b) => b.id - a.id,
};

function dateValue(iso: string | null): number {
    return iso === null ? 0 : new Date(iso).getTime();
}

// Книги без рейтинга (0) считаются «не оценена» и не отсеиваются фильтром рейтинга.
export function filterAndSortBooks(books: Book[], filters: BooksFilters): Book[] {
    const search = filters.search.trim().toLowerCase();

    return books
        .filter((book) => {
            if (
                search !== '' &&
                !book.title.toLowerCase().includes(search) &&
                !book.author.toLowerCase().includes(search)
            ) {
                return false;
            }

            if (filters.statuses.length > 0 && !filters.statuses.includes(book.status)) {
                return false;
            }

            if (
                filters.selectedTags.length > 0 &&
                !book.tags.some((tag) => filters.selectedTags.includes(tag))
            ) {
                return false;
            }

            if (filters.minRating > 0 && book.rating > 0 && book.rating < filters.minRating) {
                return false;
            }

            return true;
        })
        .toSorted(SORTERS[filters.sort]);
}

export function collectBookTags(books: Book[]): string[] {
    return [...new Set(books.flatMap((book) => book.tags))].sort((a, b) => a.localeCompare(b));
}

export function countActiveBookFilters(filters: BooksFilters): number {
    return (
        Number(filters.search.trim() !== '') +
        Number(filters.statuses.length > 0 && filters.statuses.length < BOOK_STATUS_ORDER.length) +
        filters.selectedTags.length +
        Number(filters.minRating > 0)
    );
}
