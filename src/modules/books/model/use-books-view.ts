'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    BOOK_STATUS_ORDER,
    DEFAULT_BOOKS_FILTERS,
    PAGE_SIZES,
    countActiveBookFilters,
    hasBookFilters,
    serializeBooksQuery,
    type BooksFilters,
    type BooksQuery,
    type BooksSort,
    type BooksViewMode,
} from '../domain/book-filters';
import type { BookStatus } from '../domain/book';

function getLibraryHref(query: BooksQuery): string {
    const search = serializeBooksQuery(query);
    return search ? `/library?${search}` : '/library';
}

export function useBooksView(query: BooksQuery) {
    const router = useRouter();
    const queryKey = serializeBooksQuery(query);
    const [queryState, setQueryState] = useState(() => ({
        key: queryKey,
        filters: query.filters,
        page: query.page,
        pageSize: query.pageSize,
    }));
    const [view, setView] = useState<BooksViewMode>('grid');
    const [isPending, startTransition] = useTransition();
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { filters, page, pageSize } = queryState;

    if (queryState.key !== queryKey) {
        setQueryState({ key: queryKey, filters: query.filters, page: query.page, pageSize: query.pageSize });
    }

    useEffect(() => {
        if (searchTimer.current !== null) clearTimeout(searchTimer.current);
    }, [queryKey]);

    useEffect(() => () => {
        if (searchTimer.current !== null) clearTimeout(searchTimer.current);
    }, []);

    const navigate = useCallback((nextFilters: BooksFilters, nextPage: number, nextPageSize: BooksQuery['pageSize'], history: 'push' | 'replace' = 'replace') => {
        if (searchTimer.current !== null) clearTimeout(searchTimer.current);
        setQueryState((current) => ({ ...current, filters: nextFilters, page: nextPage, pageSize: nextPageSize }));

        const href = getLibraryHref({ filters: nextFilters, page: nextPage, pageSize: nextPageSize });
        startTransition(() => {
            if (history === 'push') router.push(href, { scroll: false });
            else router.replace(href, { scroll: false });
        });
    }, [router]);

    const setSearch = useCallback((search: string) => {
        const nextFilters = { ...filters, search };
        setQueryState((current) => ({ ...current, filters: nextFilters, page: 1 }));

        if (searchTimer.current !== null) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            const href = getLibraryHref({ filters: nextFilters, page: 1, pageSize });
            startTransition(() => router.replace(href, { scroll: false }));
        }, 300);
    }, [filters, pageSize, router]);

    const toggleStatus = useCallback((status: BookStatus) => {
        const statuses = filters.statuses.includes(status)
            ? filters.statuses.filter((item) => item !== status)
            : BOOK_STATUS_ORDER.filter((item) => filters.statuses.includes(item) || item === status);
        navigate({ ...filters, statuses }, 1, pageSize);
    }, [filters, navigate, pageSize]);

    const toggleTag = useCallback((tag: string) => {
        const selectedTags = filters.selectedTags.includes(tag)
            ? filters.selectedTags.filter((item) => item !== tag)
            : [...filters.selectedTags, tag];
        navigate({ ...filters, selectedTags }, 1, pageSize);
    }, [filters, navigate, pageSize]);

    const setMinRating = useCallback((minRating: number) => {
        navigate({ ...filters, minRating }, 1, pageSize);
    }, [filters, navigate, pageSize]);

    const setSort = useCallback((sort: BooksSort) => {
        navigate({ ...filters, sort }, page, pageSize);
    }, [filters, navigate, page, pageSize]);

    const clearFilters = useCallback(() => {
        navigate(DEFAULT_BOOKS_FILTERS, 1, pageSize);
    }, [navigate, pageSize]);

    const toggleView = useCallback(() => {
        setView((current) => (current === 'grid' ? 'list' : 'grid'));
    }, []);

    const changePageSize = useCallback((value: string) => {
        const nextPageSize = Number(value);
        if (PAGE_SIZES.includes(nextPageSize as BooksQuery['pageSize'])) {
            navigate(filters, 1, nextPageSize as BooksQuery['pageSize']);
        }
    }, [filters, navigate]);

    const changePage = useCallback((nextPage: number) => {
        navigate(filters, nextPage, pageSize, 'push');
    }, [filters, navigate, pageSize]);

    return {
        view,
        setView,
        toggleView,
        search: filters.search,
        setSearch,
        statuses: filters.statuses,
        toggleStatus,
        selectedTags: filters.selectedTags,
        toggleTag,
        minRating: filters.minRating,
        setMinRating,
        sort: filters.sort,
        setSort,
        clearFilters,
        hasFilters: hasBookFilters(filters),
        activeFilterCount: countActiveBookFilters(filters),
        page,
        pageSize,
        isPending,
        setPage: changePage,
        changePageSize,
    };
}
