'use client';

import { BookOpen, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { useLocale } from '@/shared/i18n/locale-provider';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import type { Book } from '../domain/book';
import { booksCopy } from '../domain/i18n';
import { useBooksView } from '../model/use-books-view';
import { BookCard } from '../ui/book-card';
import { BooksFilters } from '../ui/books-filters';
import { BooksPagination } from '../ui/books-pagination';

type BooksListViewProps = {
    books: Book[];
};

export function BooksListView({ books }: BooksListViewProps) {
    const locale = useLocale();
    const t = booksCopy[locale];
    const v = useBooksView(books);

    return (
        <div>
            <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                        {t.list.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t.list.showingPrefix}{' '}
                        <span className="font-medium text-foreground">{v.filteredCount}</span> {t.list.showingOf}{' '}
                        <span className="font-medium text-foreground">{v.totalCount}</span>
                    </p>
                </div>

                <div className="hidden items-center rounded-lg border border-border/70 bg-card/60 p-1 sm:flex">
                    <Button
                        variant={v.view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => v.setView('grid')}
                        className="h-8 gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        {t.list.viewGrid}
                    </Button>

                    <Button
                        variant={v.view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => v.setView('list')}
                        className="h-8 gap-2"
                    >
                        <BookOpen className="h-4 w-4" />
                        {t.list.viewList}
                    </Button>
                </div>
            </header>

            <section className="sticky top-16 z-20 mb-8 rounded-2xl border border-border/70 bg-background/85 p-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/30">
                <div className="hidden md:block">
                    <BooksFilters
                        search={v.search}
                        setSearch={v.setSearch}
                        statuses={v.statuses}
                        toggleStatus={v.toggleStatus}
                        tags={v.tags}
                        selectedTags={v.selectedTags}
                        toggleTag={v.toggleTag}
                        minRating={v.minRating}
                        setMinRating={v.setMinRating}
                        sort={v.sort}
                        setSort={v.setSort}
                        clearFilters={v.clearFilters}
                        hasFilters={v.hasFilters}
                    />
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="flex-1">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                {t.list.filtersButton}
                                {v.activeFilterCount > 0 && (
                                    <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                                        {v.activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="bottom" className="max-h-[90vh] rounded-t-2xl">
                            <SheetHeader>
                                <SheetTitle>{t.list.filtersButton}</SheetTitle>
                            </SheetHeader>

                            <ScrollArea className="mt-6 h-[65vh] pr-4">
                                <BooksFilters
                                    search={v.search}
                                    setSearch={v.setSearch}
                                    statuses={v.statuses}
                                    toggleStatus={v.toggleStatus}
                                    tags={v.tags}
                                    selectedTags={v.selectedTags}
                                    toggleTag={v.toggleTag}
                                    minRating={v.minRating}
                                    setMinRating={v.setMinRating}
                                    sort={v.sort}
                                    setSort={v.setSort}
                                    clearFilters={v.clearFilters}
                                    hasFilters={v.hasFilters}
                                />
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={v.toggleView}
                        aria-label={t.list.toggleViewAria}
                    >
                        {v.view === 'grid' ? <BookOpen className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                    </Button>
                </div>
            </section>

            {v.isEmpty ? (
                <div className="flex min-h-105 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                        <BookOpen className="h-7 w-7 text-primary/70" />
                    </div>

                    <h2 className="font-heading text-lg font-bold tracking-tight">{t.list.emptyTitle}</h2>

                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {t.list.emptyDescription}
                    </p>

                    <Button onClick={v.clearFilters} variant="outline" className="mt-5">
                        {t.list.resetFilters}
                    </Button>
                </div>
            ) : (
                <div
                    className={
                        v.view === 'grid'
                            ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                            : 'grid grid-cols-1 gap-3'
                    }
                >
                    {v.visibleBooks.map((book) => (
                        <BookCard key={book.id} book={book} view={v.view} />
                    ))}
                </div>
            )}

            {v.filteredCount > 0 && (
                <BooksPagination
                    page={v.page}
                    totalPages={v.totalPages}
                    pageSize={v.pageSize}
                    onPageChange={v.setPage}
                    onPageSizeChange={v.changePageSize}
                />
            )}
        </div>
    );
}
