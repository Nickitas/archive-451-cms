import { BookOpen } from 'lucide-react';
import { SiteContainer } from '@/shared/components/site-container';
import { formatDate } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';
import { sharingCopy } from '../domain/i18n';
import type { SharedBook } from '../domain/share';

export function SharedLibraryView({ books, locale }: { books: SharedBook[]; locale: Locale }) {
    const t = sharingCopy[locale].shared;

    return (
        <main className="min-h-[calc(100svh-4rem)] bg-background py-10 text-foreground">
            <SiteContainer>
                <header className="mb-8">
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                </header>

                {books.length === 0 ? (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
                        <BookOpen aria-hidden className="mb-3 h-7 w-7 text-primary/70" />
                        <p className="text-sm text-muted-foreground">{t.noBooks}</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {books.map((book) => (
                            <article key={book.id} className="flex gap-4 rounded-2xl border border-border/70 bg-card/60 p-4">
                                {book.coverPath ? (
                                    // Open Library and Payload storage URLs are rendered directly by the browser.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={book.coverPath}
                                        alt={book.title}
                                        loading="lazy"
                                        className="h-44 w-28 shrink-0 rounded-lg bg-muted object-contain"
                                    />
                                ) : (
                                    <div className="flex h-44 w-28 shrink-0 items-center justify-center rounded-lg bg-muted text-primary/70">
                                        <BookOpen aria-hidden className="h-8 w-8" />
                                    </div>
                                )}

                                <div className="min-w-0 py-1">
                                    <h2 className="line-clamp-3 font-heading text-lg font-semibold leading-snug">{book.title}</h2>
                                    {book.author !== '' && <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>}
                                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                                            {t.status[book.status]}
                                        </span>
                                        {book.rating > 0 && <span className="rounded-full bg-muted px-2.5 py-1">{t.rating(book.rating)}</span>}
                                    </div>
                                    {book.finishedAt && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {t.finishedAt(formatDate(locale, book.finishedAt, { day: 'numeric', month: 'short', year: 'numeric' }))}
                                        </p>
                                    )}
                                    {book.description !== '' && (
                                        <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{book.description}</p>
                                    )}
                                    {book.tags.length > 0 && (
                                        <ul className="mt-3 flex flex-wrap gap-1.5">
                                            {book.tags.map((tag) => (
                                                <li key={tag} className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </SiteContainer>
        </main>
    );
}
