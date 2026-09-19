'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    DEFAULT_BOOKS_FILTERS,
    PAGE_SIZES,
    collectBookTags,
    countActiveBookFilters,
    filterAndSortBooks,
    type BooksFilters,
    type BooksSort,
    type BooksViewMode,
} from '../domain/book-filters';
import type { Book, BookStatus } from '../domain/book';

export function useBooksView(books: Book[]) {
    const [filters, setFilters] = useState<BooksFilters>(DEFAULT_BOOKS_FILTERS);
    const [view, setView] = useState<BooksViewMode>('grid');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const tags = useMemo(() => collectBookTags(books), [books]);

    const filteredBooks = useMemo(() => filterAndSortBooks(books, filters), [books, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleBooks = useMemo(
        () => filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [filteredBooks, currentPage, pageSize],
    );

    const hasFilters =
        filters.search.trim() !== '' ||
        filters.statuses.length > 0 ||
        filters.selectedTags.length > 0 ||
        filters.minRating > 0;

    const activeFilterCount = countActiveBookFilters(filters);

    const setSearch = useCallback((search: string) => {
        setFilters((current) => ({ ...current, search }));
        setPage(1);
    }, []);

    const toggleStatus = useCallback((status: BookStatus) => {
        setFilters((current) => ({
            ...current,
            statuses: current.statuses.includes(status)
                ? current.statuses.filter((item) => item !== status)
                : [...current.statuses, status],
        }));
        setPage(1);
    }, []);

    const toggleTag = useCallback((tag: string) => {
        setFilters((current) => ({
            ...current,
            selectedTags: current.selectedTags.includes(tag)
                ? current.selectedTags.filter((item) => item !== tag)
                : [...current.selectedTags, tag],
        }));
        setPage(1);
    }, []);

    const setMinRating = useCallback((minRating: number) => {
        setFilters((current) => ({ ...current, minRating }));
        setPage(1);
    }, []);

    const setSort = useCallback((sort: BooksSort) => {
        setFilters((current) => ({ ...current, sort }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_BOOKS_FILTERS);
        setPage(1);
    }, []);

    const toggleView = useCallback(() => {
        setView((current) => (current === 'grid' ? 'list' : 'grid'));
    }, []);

    const changePageSize = useCallback((value: string) => {
        setPageSize(Number(value));
        setPage(1);
    }, []);

    return {
        view,
        setView,
        toggleView,
        search: filters.search,
        setSearch,
        tags,
        statuses: filters.statuses,
        toggleStatus,
        selectedTags: filters.selectedTags,
        toggleTag,
        minRating: filters.minRating,
        setMinRating,
        sort: filters.sort,
        setSort,
        clearFilters,
        hasFilters,
        activeFilterCount,
        totalCount: books.length,
        filteredCount: filteredBooks.length,
        visibleBooks,
        isEmpty: visibleBooks.length === 0,
        page: currentPage,
        totalPages,
        pageSize,
        changePageSize,
        setPage,
    };
}
