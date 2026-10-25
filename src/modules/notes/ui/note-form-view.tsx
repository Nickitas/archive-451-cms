'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { MarkdownContent } from '@/shared/components/markdown-content';
import { useLocale } from '@/shared/i18n/locale-provider';
import type { MarkdownTarget } from '@/shared/markdown/obsidian';
import { notesCopy } from '../domain/i18n';
import type { Note, NoteBookOption, NoteFormState } from '../domain/note';

type NoteFormViewProps = {
    note: Note | null;
    books: NoteBookOption[];
    initialBookId?: number;
    targets: MarkdownTarget[];
    state: NoteFormState;
    formAction: (formData: FormData) => void | Promise<void>;
    pending: boolean;
};

export function NoteFormView({ note, books, initialBookId, targets, state, formAction, pending }: NoteFormViewProps) {
    const locale = useLocale();
    const t = notesCopy[locale];
    const [title, setTitle] = useState(note?.title ?? '');
    const [bookId, setBookId] = useState(initialBookId === undefined ? '' : String(initialBookId));
    const [content, setContent] = useState(note?.content ?? '');
    const titleError = state.fieldErrors?.title?.[0];
    const bookError = state.fieldErrors?.bookId?.[0];

    if (!note && books.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
                <div>
                    <h2 className="font-heading text-lg font-semibold">{t.editor.noBooksTitle}</h2>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">{t.editor.noBooksDescription}</p>
                </div>
                <Button asChild>
                    <Link href="/library">{t.editor.goToLibrary}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-lg shadow-black/5 sm:p-7 dark:shadow-black/30">
            <form action={formAction} className="flex flex-col gap-5">
                {note && <input type="hidden" name="noteId" value={note.id} />}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="note-title" className="text-sm font-medium">
                        {t.editor.titleLabel}
                    </label>
                    <Input
                        id="note-title"
                        name="title"
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        aria-invalid={Boolean(titleError)}
                        aria-describedby={titleError ? 'note-title-error' : undefined}
                        className="h-10"
                    />
                    {titleError && (
                        <p id="note-title-error" className="text-sm text-destructive">
                            {titleError}
                        </p>
                    )}
                </div>

                {note ? (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{t.editor.bookLabel}</span>
                        <p className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                            {note.bookTitle}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="note-book" className="text-sm font-medium">
                            {t.editor.bookLabel}
                        </label>
                        <select
                            id="note-book"
                            name="bookId"
                            required
                            value={bookId}
                            onChange={(event) => setBookId(event.target.value)}
                            aria-invalid={Boolean(bookError)}
                            aria-describedby={bookError ? 'note-book-error' : undefined}
                            className="h-10 w-full rounded-3xl border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
                        >
                            <option value="" disabled>
                                {t.editor.chooseBook}
                            </option>
                            {books.map((book) => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                        {bookError && (
                            <p id="note-book-error" className="text-sm text-destructive">
                                {bookError}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="note-content" className="text-sm font-medium">
                        {t.editor.contentLabel}
                    </label>
                    <textarea
                        id="note-content"
                        name="content"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        spellCheck
                        className="min-h-72 w-full resize-y rounded-2xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    />
                    <p className="text-xs text-muted-foreground">{t.editor.markdownHint}</p>
                </div>

                <details className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <summary className="cursor-pointer text-sm font-medium">{t.editor.previewLabel}</summary>
                    <div className="mt-4">
                        {content.trim() === '' ? (
                            <p className="text-muted-foreground">{t.editor.previewEmpty}</p>
                        ) : (
                            <MarkdownContent content={content} targets={targets} className="min-h-8" />
                        )}
                    </div>
                </details>

                {state.error && (
                    <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {state.error}
                    </p>
                )}
                {state.success && (
                    <p role="status" aria-live="polite" className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                        {state.success}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" size="lg" disabled={pending}>
                        {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                        {pending
                            ? note
                                ? t.editor.updatePending
                                : t.editor.createPending
                            : note
                              ? t.editor.updateSubmit
                              : t.editor.createSubmit}
                    </Button>
                    <Button asChild variant="ghost" size="lg">
                        <Link href="/notes">{t.editor.backToNotes}</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}
