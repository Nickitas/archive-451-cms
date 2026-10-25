'use client';

import { useActionState } from 'react';
import { createBookAction, searchBooksAction } from '../actions/book-editor';
import {
    BOOK_CREATE_STATE_INITIAL,
    BOOK_SEARCH_STATE_INITIAL,
    type BookCreateState,
    type BookSearchState,
} from '../domain/book-editor';

export type BookSearchFormAction = (formData: FormData) => void;
export type BookCreateFormAction = (formData: FormData) => void;

export function useBookEditor() {
    const [searchState, searchAction, searchPending] = useActionState<BookSearchState, FormData>(
        searchBooksAction,
        BOOK_SEARCH_STATE_INITIAL,
    );
    const [createState, createAction, createPending] = useActionState<BookCreateState, FormData>(
        createBookAction,
        BOOK_CREATE_STATE_INITIAL,
    );

    return { searchState, searchAction, searchPending, createState, createAction, createPending };
}
