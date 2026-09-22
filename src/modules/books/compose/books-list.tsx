import { Suspense } from 'react';
import { BooksRepository } from '../repository/books-repository';
import { LibrarySkeleton } from '../ui/book-skeleton';
import { BooksListView } from './books-list-view';
import { SiteContainer } from '@/shared/components/site-container';

export function BooksList() {
    return (
        <main className="relative flex h-[calc(100svh-4rem)] flex-col overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative flex min-h-0 flex-1 flex-col">
                <Suspense fallback={<LibrarySkeleton />}>
                    <BooksListData />
                </Suspense>
            </SiteContainer>
        </main>
    );
}

async function BooksListData() {
    const books = await BooksRepository.getAllBooks();

    return <BooksListView books={books} />;
}
