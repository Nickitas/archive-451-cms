'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { getLocale } from '@/shared/i18n/get-locale';
import { booksCopy } from '../domain/i18n';
import type { BookCreateState, BookSearchState } from '../domain/book-editor';
import { isOpenLibraryCoverUrl, isSafeHttpUrl } from '../domain/book-editor';
import { BooksRepository } from '../repository/books-repository';
import { OpenLibraryRepository } from '../repository/open-library-repository';

function formString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

export async function searchBooksAction(
    _state: BookSearchState,
    formData: FormData,
): Promise<BookSearchState> {
    const [locale, user] = await Promise.all([getLocale(), AuthRepository.me()]);
    const t = booksCopy[locale];

    if (!user) {
        return { results: [], searched: false, error: t.editor.sessionExpired };
    }

    const validated = z
        .object({ query: z.string().trim().min(2, t.editor.queryTooShort).max(100, t.editor.queryTooLong) })
        .safeParse({ query: formString(formData.get('query')) });

    if (!validated.success) {
        return {
            results: [],
            searched: false,
            error: z.flattenError(validated.error).fieldErrors.query?.[0] ?? t.editor.searchFailed,
        };
    }

    const query = validated.data.query;
    const isbn = query.replace(/[\s-]/gu, '');
    const searchQuery = /^(?:\d{9}[\dX]|\d{13})$/iu.test(isbn) ? `isbn:${isbn}` : query;

    try {
        const results = await OpenLibraryRepository.searchBooks(searchQuery, locale);
        return { results, searched: true };
    } catch {
        return { results: [], searched: false, error: t.editor.searchFailed };
    }
}

export async function createBookAction(
    _state: BookCreateState,
    formData: FormData,
): Promise<BookCreateState> {
    const [locale, user] = await Promise.all([getLocale(), AuthRepository.me()]);
    const t = booksCopy[locale];

    if (!user) {
        return { error: t.editor.sessionExpired };
    }

    const optionalUrl = (message: string, validate: (value: string) => boolean) =>
        z.string().trim().max(2048, message).refine((value) => value === '' || validate(value), message);
    const validated = z
        .object({
            title: z.string().trim().min(1, t.editor.titleRequired).max(300, t.editor.titleTooLong),
            author: z.string().trim().max(300, t.editor.authorTooLong),
            description: z.string().trim().max(10_000, t.editor.descriptionTooLong),
            sourceUrl: optionalUrl(t.editor.invalidSourceUrl, isSafeHttpUrl),
            coverUrl: optionalUrl(t.editor.invalidCoverUrl, isOpenLibraryCoverUrl),
        })
        .safeParse({
            title: formString(formData.get('title')),
            author: formString(formData.get('author')),
            description: formString(formData.get('description')),
            sourceUrl: formString(formData.get('sourceUrl')),
            coverUrl: formString(formData.get('coverUrl')),
        });

    if (!validated.success) {
        return { fieldErrors: z.flattenError(validated.error).fieldErrors };
    }

    let bookId: number;
    try {
        bookId = await BooksRepository.createBook(user.id, validated.data);
    } catch {
        return { error: t.editor.createFailed };
    }

    revalidatePath('/library');
    revalidatePath('/profile');
    revalidatePath('/');
    revalidatePath(`/books/${bookId}`);
    redirect(`/books/${bookId}`);
}
