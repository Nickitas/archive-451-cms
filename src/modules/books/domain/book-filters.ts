import { BOOK_STATUS_ORDER, type Book, type BookStatus } from './book';

export { BOOK_STATUS_ORDER };

export const MAX_RATING = 10;
export const PAGE_SIZES = [12, 24, 48] as const;
export const RATING_FILTER_OPTIONS = [0, 4, 5, 6, 7, 8, 9] as const;

export type BooksViewMode = 'grid' | 'list';

export type BooksSort = 'title-asc' | 'rating-desc' | 'finished-desc' | 'added-desc';

export const BOOKS_SORT_ORDER: BooksSort[] = ['title-asc', 'rating-desc', 'finished-desc', 'added-desc'];

export type BooksFilters = {
    search: string;
    statuses: BookStatus[];
    selectedTags: string[];
    minRating: number;
    sort: BooksSort;
};

export type BooksQuery = {
    filters: BooksFilters;
    page: number;
    pageSize: (typeof PAGE_SIZES)[number];
};

export type BooksPageResult = {
    books: Book[];
    tags: string[];
    page: number;
    pageSize: BooksQuery['pageSize'];
    totalPages: number;
    filteredCount: number;
    totalCount: number;
};

export type BooksSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_BOOKS_FILTERS: BooksFilters = {
    search: '',
    statuses: [],
    selectedTags: [],
    minRating: 0,
    sort: 'title-asc',
};

export const DEFAULT_BOOKS_QUERY: BooksQuery = {
    filters: DEFAULT_BOOKS_FILTERS,
    page: 1,
    pageSize: PAGE_SIZES[0],
};

function valuesFor(params: BooksSearchParams, key: string): string[] {
    const value = params[key];
    if (Array.isArray(value)) return value;
    return value === undefined ? [] : [value];
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
    if (value === undefined || !/^\d+$/u.test(value)) return fallback;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseBooksQuery(params: BooksSearchParams): BooksQuery {
    const statuses = valuesFor(params, 'status').filter(
        (value): value is BookStatus => BOOK_STATUS_ORDER.includes(value as BookStatus),
    );
    const selectedTags = [...new Set(valuesFor(params, 'tag').filter((tag) => tag.length > 0 && tag.length <= 100))];
    const rawRating = Number(valuesFor(params, 'rating')[0]);
    const minRating = RATING_FILTER_OPTIONS.includes(rawRating as (typeof RATING_FILTER_OPTIONS)[number])
        ? rawRating
        : 0;
    const rawSort = valuesFor(params, 'sort')[0];
    const sort = BOOKS_SORT_ORDER.includes(rawSort as BooksSort) ? (rawSort as BooksSort) : 'title-asc';
    const rawPageSize = Number(valuesFor(params, 'size')[0]);
    const pageSize = PAGE_SIZES.includes(rawPageSize as (typeof PAGE_SIZES)[number])
        ? (rawPageSize as (typeof PAGE_SIZES)[number])
        : PAGE_SIZES[0];

    return {
        filters: {
            search: (valuesFor(params, 'q')[0] ?? '').slice(0, 200),
            statuses: [...new Set(statuses)],
            selectedTags,
            minRating,
            sort,
        },
        page: parsePositiveInteger(valuesFor(params, 'page')[0], 1),
        pageSize,
    };
}

export function serializeBooksQuery(query: BooksQuery): string {
    const params = new URLSearchParams();
    const { filters } = query;
    const search = filters.search.trim();

    if (search) params.set('q', search);
    for (const status of BOOK_STATUS_ORDER) {
        if (filters.statuses.includes(status)) params.append('status', status);
    }
    for (const tag of [...filters.selectedTags].sort((a, b) => a.localeCompare(b))) {
        params.append('tag', tag);
    }
    if (filters.minRating > 0) params.set('rating', String(filters.minRating));
    if (filters.sort !== 'title-asc') params.set('sort', filters.sort);
    if (query.page > 1) params.set('page', String(query.page));
    if (query.pageSize !== PAGE_SIZES[0]) params.set('size', String(query.pageSize));

    return params.toString();
}

export function collectBookTags(tags: string[]): string[] {
    return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}

export function hasBookFilters(filters: BooksFilters): boolean {
    return (
        filters.search.trim() !== '' ||
        filters.statuses.length > 0 ||
        filters.selectedTags.length > 0 ||
        filters.minRating > 0
    );
}

export function countActiveBookFilters(filters: BooksFilters): number {
    return (
        Number(filters.search.trim() !== '') +
        Number(filters.statuses.length > 0 && filters.statuses.length < BOOK_STATUS_ORDER.length) +
        filters.selectedTags.length +
        Number(filters.minRating > 0)
    );
}
