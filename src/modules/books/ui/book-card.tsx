'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Star } from 'lucide-react';
import { cn } from 'cn';
import { useLocale } from '@/shared/i18n/locale-provider';
import type { Book } from '../domain/book';
import { pluralizeNotes } from '../domain/note';
import { StatusBadge } from './status-badge';

type BookCardProps = {
    book: Book;
    view: 'grid' | 'list';
};

export function BookCard({ book, view }: BookCardProps) {
    const locale = useLocale();
    const isList = view === 'list';
    const maxTags = isList ? 4 : 2;

    return (
        <Link
            href={`/books/${book.id}`}
            className={cn(
                'group relative block overflow-hidden rounded-2xl border border-border/80 bg-card/40 transition-all duration-300',
                isList
                    ? 'flex items-center gap-3 p-3 hover:border-primary/30 hover:bg-card/70 sm:gap-4'
                    : 'flex flex-col hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40',
            )}
        >
            <div
                className={cn(
                    'relative shrink-0 overflow-hidden bg-linear-to-br from-muted to-card',
                    isList ? 'aspect-[2/3] w-16 rounded-lg sm:w-20' : 'aspect-[2/3] w-full',
                )}
            >
                {book.coverPath ? (
                    <>
                        <img
                            src={book.coverPath}
                            alt={book.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {!isList && (
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <BookOpen className="h-8 w-8" />
                    </div>
                )}

                {!isList && (
                    <>
                        <div className="absolute left-2 top-2">
                            <StatusBadge status={book.status} />
                        </div>

                        {book.rating > 0 && (
                            <div className="absolute right-2 top-2">
                                <RatingPill rating={book.rating} />
                            </div>
                        )}
                    </>
                )}
            </div>

            {isList ? (
                <>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                        <h3 className="truncate font-medium">{book.title}</h3>

                        <p className="truncate text-sm text-muted-foreground">
                            {book.author !== '' && <span>{book.author}</span>}
                            {book.author !== '' && book.notesCount > 0 && (
                                <span className="mx-1.5 text-border">·</span>
                            )}
                            {book.notesCount > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {pluralizeNotes(locale, book.notesCount)}
                                </span>
                            )}
                        </p>

                        {book.tags.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                                {book.tags.slice(0, maxTags).map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}

                                {book.tags.length > maxTags && (
                                    <span className="self-center text-[11px] text-muted-foreground/70">
                                        +{book.tags.length - maxTags}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
                        <StatusBadge status={book.status} />

                        {book.rating > 0 && <RatingPill rating={book.rating} />}
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 self-center text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </>
            ) : (
                <div className="flex flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-2 font-medium">{book.title}</h3>

                    {book.author !== '' && (
                        <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {pluralizeNotes(locale, book.notesCount)}
                        </span>

                        {book.tags.slice(0, maxTags).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}

                        {book.tags.length > maxTags && <span>+{book.tags.length - maxTags}</span>}
                    </div>
                </div>
            )}
        </Link>
    );
}

function RatingPill({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/25 backdrop-blur-md">
            <Star className="h-3 w-3 fill-current" />
            {rating.toFixed(1)}
        </span>
    );
}
