import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { formatDate } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';
import { notesCopy } from '../domain/i18n';
import type { Note } from '../domain/note';

type NotesListViewProps = {
    notes: Note[];
    locale: Locale;
    activeTag: string | null;
    search: string;
};

export function NotesListView({ notes, locale, activeTag, search }: NotesListViewProps) {
    const t = notesCopy[locale];
    const clearSearchHref = activeTag === null ? '/notes' : `/notes?tag=${encodeURIComponent(activeTag)}`;

    return (
        <section className="flex flex-col gap-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                        {t.list.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">{t.list.description}</p>
                </div>
                <Button asChild>
                    <Link href="/notes/new">
                        <Plus aria-hidden className="h-4 w-4" />
                        {t.list.add}
                    </Link>
                </Button>
            </header>

            <form action="/notes" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="notes-search" className="sr-only">{t.list.searchLabel}</label>
                <Input
                    id="notes-search"
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder={t.list.searchPlaceholder}
                    className="sm:max-w-xl"
                />
                {activeTag !== null && <input type="hidden" name="tag" value={activeTag} />}
                <Button type="submit" variant="outline" className="sm:w-auto">
                    <Search aria-hidden className="h-4 w-4" />
                    {t.list.searchSubmit}
                </Button>
            </form>

            {search !== '' && (
                <p className="-mt-4 text-sm text-muted-foreground">
                    {t.list.searchingFor(search)}{' '}
                    <Link href={clearSearchHref} className="font-medium text-primary underline-offset-4 hover:underline">
                        {t.list.clearSearch}
                    </Link>
                </p>
            )}

            {activeTag !== null && (
                <p className="-mt-3 text-sm text-muted-foreground">
                    {t.list.filteringByTag(activeTag)}{' '}
                    <Link href="/notes" className="font-medium text-primary underline-offset-4 hover:underline">
                        {t.list.clearFilter}
                    </Link>
                </p>
            )}

            {notes.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
                    <h2 className="font-heading text-lg font-semibold">
                            {search !== ''
                                ? t.list.searchEmptyTitle
                                : activeTag === null ? t.list.emptyTitle : t.list.filteredEmptyTitle(activeTag)}
                    </h2>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        {search !== ''
                            ? t.list.searchEmptyDescription
                            : activeTag === null ? t.list.emptyDescription : t.list.filteredEmptyDescription}
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href={search !== '' ? clearSearchHref : activeTag === null ? '/notes/new' : '/notes'}>
                            {search !== '' ? t.list.clearSearch : activeTag === null ? t.list.add : t.list.clearFilter}
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {notes.map((note) => (
                        <article
                            key={note.id}
                            className="rounded-2xl border border-border/70 bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card/80"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="line-clamp-2 font-medium">
                                    <Link
                                        href={`/notes/${note.id}`}
                                        aria-label={t.list.editAria(note.title)}
                                        className="rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                                    >
                                        {note.title}
                                    </Link>
                                </h2>
                                <time dateTime={note.createdAt} className="shrink-0 text-xs text-muted-foreground">
                                    {formatDate(locale, note.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </time>
                            </div>
                            <p className="mt-3 text-sm">
                                <Link href={`/books/${note.bookId}`} className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                                    {note.bookTitle}
                                </Link>
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
