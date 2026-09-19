import { Suspense } from 'react';
import { BooksRepository } from '../repository/books-repository';
import { BookSkeleton } from '../ui/book-skeleton';
import { BooksListView } from './books-list-view';
import { SiteContainer } from '@/shared/components/site-container';

export function BooksList() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative py-8">
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <BookSkeleton key={index} />
                            ))}
                        </div>
                    }
                >
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
