export type BookSuggestion = {
    id: string;
    title: string;
    author: string;
    description: string;
    coverUrl: string;
    sourceUrl: string;
    publishedYear: number | null;
};

export type BookCreateInput = {
    title: string;
    author: string;
    description: string;
    coverUrl: string;
    sourceUrl: string;
};

export type BookSearchState = {
    results: BookSuggestion[];
    searched: boolean;
    error?: string;
};

export type BookCreateState = {
    error?: string;
    fieldErrors?: Partial<Record<'title' | 'author' | 'description' | 'sourceUrl' | 'coverUrl', string[]>>;
};

export const BOOK_SEARCH_STATE_INITIAL: BookSearchState = {
    results: [],
    searched: false,
};

export const BOOK_CREATE_STATE_INITIAL: BookCreateState = {};

export function isSafeHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return (url.protocol === 'http:' || url.protocol === 'https:') && url.username === '' && url.password === '';
    } catch {
        return false;
    }
}

export function isOpenLibraryCoverUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return (
            url.protocol === 'https:' &&
            url.hostname === 'covers.openlibrary.org' &&
            url.username === '' &&
            url.password === '' &&
            /^\/b\/id\/\d+-L\.jpg$/u.test(url.pathname) &&
            (url.search === '' || url.searchParams.toString() === 'default=false') &&
            url.hash === ''
        );
    } catch {
        return false;
    }
}
