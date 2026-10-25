'use client';

/* eslint-disable @next/next/no-img-element -- Open Library cover URLs are displayed directly from their Covers API. */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookPlus, LoaderCircle, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useLocale } from '@/shared/i18n/locale-provider';
import { booksCopy } from '../domain/i18n';
import type { BookCreateInput, BookSuggestion } from '../domain/book-editor';
import type { BookCreateFormAction, BookSearchFormAction } from '../model/use-book-editor';
import type { BookCreateState, BookSearchState } from '../domain/book-editor';

type BookEditorViewProps = {
    searchState: BookSearchState;
    searchAction: BookSearchFormAction;
    searchPending: boolean;
    createState: BookCreateState;
    createAction: BookCreateFormAction;
    createPending: boolean;
};

const EMPTY_BOOK: BookCreateInput = {
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    sourceUrl: '',
};

export function BookEditorView({
    searchState,
    searchAction,
    searchPending,
    createState,
    createAction,
    createPending,
}: BookEditorViewProps) {
    const locale = useLocale();
    const t = booksCopy[locale];
    const [query, setQuery] = useState('');
    const [book, setBook] = useState<BookCreateInput>(EMPTY_BOOK);

    const fillEmptyFields = (suggestion: BookSuggestion) => {
        setBook((current) => ({
            title: current.title.trim() === '' ? suggestion.title : current.title,
            author: current.author.trim() === '' ? suggestion.author : current.author,
            description: current.description.trim() === '' ? suggestion.description : current.description,
            coverUrl: current.coverUrl.trim() === '' ? suggestion.coverUrl : current.coverUrl,
            sourceUrl: current.sourceUrl.trim() === '' ? suggestion.sourceUrl : current.sourceUrl,
        }));
    };

    const fieldError = (name: keyof BookCreateInput) => createState.fieldErrors?.[name]?.[0];

    return (
        <main className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground hover:text-foreground">
                        <Link href="/library">
                            <ArrowLeft className="h-4 w-4" />
                            {t.editor.backToLibrary}
                        </Link>
                    </Button>
                    <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                        {t.editor.newTitle}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">{t.editor.newDescription}</p>
                </div>

                <section className="rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6">
                    <div className="mb-4">
                        <h2 className="font-heading text-lg font-semibold">{t.editor.searchTitle}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t.editor.searchDescription}</p>
                    </div>

                    <form action={searchAction} className="flex flex-col gap-2 sm:flex-row">
                        <label htmlFor="book-search" className="sr-only">
                            {t.editor.searchLabel}
                        </label>
                        <Input
                            id="book-search"
                            name="query"
                            type="search"
                            value={query}
                            maxLength={100}
                            placeholder={t.editor.searchPlaceholder}
                            onChange={(event) => setQuery(event.target.value)}
                            className="h-10 min-w-0 flex-1"
                        />
                        <Button type="submit" disabled={searchPending} className="sm:w-auto">
                            {searchPending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <Search aria-hidden className="h-4 w-4" />}
                            {searchPending ? t.editor.searchPending : t.editor.searchSubmit}
                        </Button>
                    </form>

                    <p className="mt-2 text-xs text-muted-foreground">{t.editor.searchManualHint}</p>

                    {searchState.error && (
                        <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {searchState.error}
                        </p>
                    )}

                    {searchState.searched && searchState.results.length === 0 && (
                        <p className="mt-4 text-sm text-muted-foreground">{t.editor.noResults}</p>
                    )}

                    {searchState.results.length > 0 && (
                        <ul className="mt-4 flex flex-col gap-3" aria-label={t.editor.resultsLabel}>
                            {searchState.results.map((suggestion) => (
                                <li key={suggestion.id}>
                                    <article className="flex gap-4 rounded-xl border border-border/70 bg-background/60 p-3">
                                        {suggestion.coverUrl !== '' ? (
                                            <img
                                                src={suggestion.coverUrl}
                                                alt=""
                                                loading="lazy"
                                                className="h-24 w-16 shrink-0 rounded-md border border-border/70 bg-muted object-cover"
                                            />
                                        ) : (
                                            <div aria-hidden className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground">
                                                <BookPlus className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex min-w-0 flex-1 flex-col items-start">
                                            <h3 className="font-medium leading-snug">{suggestion.title}</h3>
                                            {suggestion.author !== '' && (
                                                <p className="mt-1 text-sm text-muted-foreground">{suggestion.author}</p>
                                            )}
                                            {suggestion.publishedYear !== null && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {t.editor.publishedYear(suggestion.publishedYear)}
                                                </p>
                                            )}
                                            {suggestion.description !== '' && (
                                                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                                                    {suggestion.description}
                                                </p>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() => fillEmptyFields(suggestion)}
                                            >
                                                {t.editor.fillEmptyFields}
                                            </Button>
                                        </div>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-lg shadow-black/5 sm:p-7 dark:shadow-black/30">
                    <div className="mb-5">
                        <h2 className="font-heading text-lg font-semibold">{t.editor.reviewTitle}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t.editor.reviewDescription}</p>
                    </div>

                    <form action={createAction} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="book-title" className="text-sm font-medium">{t.editor.titleLabel}</label>
                            <Input
                                id="book-title"
                                name="title"
                                required
                                maxLength={300}
                                value={book.title}
                                onChange={(event) => setBook((current) => ({ ...current, title: event.target.value }))}
                                aria-invalid={Boolean(fieldError('title'))}
                                aria-describedby={fieldError('title') ? 'book-title-error' : undefined}
                                className="h-10"
                            />
                            {fieldError('title') && <FieldError id="book-title-error" message={fieldError('title')!} />}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="book-author" className="text-sm font-medium">{t.editor.authorLabel}</label>
                            <Input
                                id="book-author"
                                name="author"
                                maxLength={300}
                                value={book.author}
                                onChange={(event) => setBook((current) => ({ ...current, author: event.target.value }))}
                                aria-invalid={Boolean(fieldError('author'))}
                                aria-describedby={fieldError('author') ? 'book-author-error' : undefined}
                                className="h-10"
                            />
                            {fieldError('author') && <FieldError id="book-author-error" message={fieldError('author')!} />}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="book-description" className="text-sm font-medium">{t.editor.descriptionLabel}</label>
                            <textarea
                                id="book-description"
                                name="description"
                                maxLength={10_000}
                                value={book.description}
                                onChange={(event) => setBook((current) => ({ ...current, description: event.target.value }))}
                                aria-invalid={Boolean(fieldError('description'))}
                                aria-describedby={fieldError('description') ? 'book-description-error' : undefined}
                                className="min-h-36 w-full resize-y rounded-2xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
                            />
                            {fieldError('description') && <FieldError id="book-description-error" message={fieldError('description')!} />}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="book-cover-url" className="text-sm font-medium">{t.editor.coverUrlLabel}</label>
                                <Input
                                    id="book-cover-url"
                                    name="coverUrl"
                                    type="url"
                                    maxLength={2048}
                                    value={book.coverUrl}
                                    onChange={(event) => setBook((current) => ({ ...current, coverUrl: event.target.value }))}
                                    aria-invalid={Boolean(fieldError('coverUrl'))}
                                    aria-describedby={fieldError('coverUrl') ? 'book-cover-url-error' : undefined}
                                    className="h-10"
                                />
                                {fieldError('coverUrl') && <FieldError id="book-cover-url-error" message={fieldError('coverUrl')!} />}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="book-source-url" className="text-sm font-medium">{t.editor.sourceUrlLabel}</label>
                                <Input
                                    id="book-source-url"
                                    name="sourceUrl"
                                    type="url"
                                    maxLength={2048}
                                    value={book.sourceUrl}
                                    onChange={(event) => setBook((current) => ({ ...current, sourceUrl: event.target.value }))}
                                    aria-invalid={Boolean(fieldError('sourceUrl'))}
                                    aria-describedby={fieldError('sourceUrl') ? 'book-source-url-error' : undefined}
                                    className="h-10"
                                />
                                {fieldError('sourceUrl') && <FieldError id="book-source-url-error" message={fieldError('sourceUrl')!} />}
                            </div>
                        </div>

                        {book.coverUrl !== '' && (
                            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                                <img src={book.coverUrl} alt="" className="h-24 w-16 rounded-md border border-border/70 bg-muted object-cover" />
                                <p className="text-xs text-muted-foreground">{t.editor.coverPreview}</p>
                            </div>
                        )}

                        {createState.error && (
                            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {createState.error}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="submit" size="lg" disabled={createPending}>
                                {createPending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <BookPlus aria-hidden className="h-4 w-4" />}
                                {createPending ? t.editor.createPending : t.editor.createSubmit}
                            </Button>
                            <Button asChild variant="ghost" size="lg">
                                <Link href="/library">{t.editor.cancel}</Link>
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}

function FieldError({ id, message }: { id: string; message: string }) {
    return (
        <p id={id} className="text-sm text-destructive">
            {message}
        </p>
    );
}
