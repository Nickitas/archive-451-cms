import { Suspense } from 'react';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { BooksRepository } from '../repository/books-repository';
import { LibrarySkeleton } from '../ui/book-skeleton';
import { BooksListView } from './books-list-view';
import { SiteContainer } from '@/shared/components/site-container';
import { parseBooksQuery, type BooksSearchParams } from '../domain/book-filters';

export function BooksList({ searchParams }: { searchParams: Promise<BooksSearchParams> }) {
    return (
        <main className="relative flex h-[calc(100svh-4rem)] flex-col overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative flex min-h-0 flex-1 flex-col">
                <Suspense fallback={<LibrarySkeleton />}>
                    <BooksListData searchParams={searchParams} />
                </Suspense>
            </SiteContainer>
        </main>
    );
}

async function BooksListData({ searchParams }: { searchParams: Promise<BooksSearchParams> }) {
    const [rawSearchParams, user] = await Promise.all([searchParams, AuthRepository.me()]);
    const query = parseBooksQuery(rawSearchParams);
    const result = user === null ? {
        books: [],
        tags: [],
        page: query.page,
        pageSize: query.pageSize,
        totalPages: 1,
        filteredCount: 0,
        totalCount: 0,
    } : await BooksRepository.getBooksPage(user.id, query);

    return <BooksListView result={result} query={{ ...query, page: result.page }} />;
}
