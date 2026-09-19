import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, CalendarDays, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SiteContainer } from '@/shared/components/site-container';
import type { Book } from '../domain/book';
import { pluralizeNotes } from '../domain/note';
import { BooksRepository } from '../repository/books-repository';
import { NoteCard } from '../ui/note-card';
import { StatusBadge } from '../ui/status-badge';

export async function BookDetail({ id }: { id: number }) {
    const book = await BooksRepository.getBook(id);

    if (book === null) {
        notFound();
    }

    const notes = await BooksRepository.getBookNotes(book.id);

    return <BookDetailContent book={book} notes={notes} />;
}

type BookDetailContentProps = {
    book: Book;
    notes: Awaited<ReturnType<typeof BooksRepository.getBookNotes>>;
};

function BookDetailContent({ book, notes }: BookDetailContentProps) {
    const finishedAt =
        book.finishedAt !== null
            ? new Date(book.finishedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : null;

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative py-8">
                <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground hover:text-foreground">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Назад к библиотеке
                    </Link>
                </Button>

                <div className="grid gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
                    <BookCover book={book} />
                    <BookMeta book={book} finishedAt={finishedAt} notesCount={notes.length} />
                </div>

                <NotesSection notes={notes} />
            </SiteContainer>
        </main>
    );
}

function BookCover({ book }: { book: Book }) {
    return (
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-muted to-card shadow-xl shadow-black/5 dark:shadow-black/40">
            {book.coverPath ? (
                <img src={book.coverPath} alt={book.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <BookOpen className="h-10 w-10" />
                </div>
            )}
        </div>
    );
}

function BookMeta({
    book,
    finishedAt,
    notesCount,
}: {
    book: Book;
    finishedAt: string | null;
    notesCount: number;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div>
                <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {book.title}
                </h1>

                {book.author !== '' && <p className="mt-2 text-lg text-muted-foreground">{book.author}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={book.status} />

                {book.rating > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/25">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {book.rating.toFixed(1)} / 10
                    </span>
                )}

                {finishedAt !== null && (
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {finishedAt}
                    </span>
                )}

                <span className="rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
                    {pluralizeNotes(notesCount)}
                </span>
            </div>

            {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {book.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {book.description !== '' && (
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">{book.description}</p>
            )}

            {book.sourceUrl !== '' && (
                <Button asChild variant="outline" className="w-fit">
                    <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Открыть в Яндекс.Книгах
                    </a>
                </Button>
            )}
        </div>
    );
}

function NotesSection({ notes }: { notes: BookDetailContentProps['notes'] }) {
    return (
        <section className="mt-12">
            <div className="mb-5 flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold tracking-tight">Заметки</h2>
                <span className="rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {notes.length}
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>

            {notes.length === 0 ? (
                <div className="flex min-h-50 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Заметок пока нет — добавьте первую через админку (коллекция «Notes»).
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {notes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </div>
            )}
        </section>
    );
}
