'use client';

import { useState, type UIEvent } from 'react';
import { BookOpen, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { cn } from 'cn';
import { useLocale } from '@/shared/i18n/locale-provider';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import type { Book } from '../domain/book';
import { booksCopy } from '../domain/i18n';
import { useBooksView } from '../model/use-books-view';
import { BOOKS_GRID_CLASS } from '../ui/book-skeleton';
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
    const [collapsed, setCollapsed] = useState(false);

    // Шапка сжимается, когда список прокручен; порог — пара «строк» скролла
    const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
        setCollapsed(event.currentTarget.scrollTop > 16);
    };

    const gridClass = v.view === 'grid' ? BOOKS_GRID_CLASS : 'grid grid-cols-1 gap-3';

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header
                className={cn(
                    'flex items-center justify-between gap-4 border-b border-border/70 px-4 transition-all duration-300 ease-out',
                    collapsed ? 'py-2.5' : 'py-5',
                )}
            >
                <div className="flex min-w-0 items-baseline gap-3">
                    <h1
                        className={cn(
                            'bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading font-extrabold tracking-tight text-transparent transition-all duration-300 ease-out',
                            collapsed ? 'text-lg' : 'text-4xl sm:text-5xl',
                        )}
                    >
                        {t.list.title}
                    </h1>
                    <p
                        className={cn(
                            'truncate text-muted-foreground transition-all duration-300 ease-out',
                            collapsed ? 'text-xs' : 'text-sm',
                        )}
                    >
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

            <section className="border-b border-border/70 px-4 py-2">
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
                            <Button variant="outline" className="h-8 flex-1">
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

            <div className="min-h-0 flex-1 overflow-y-auto" onScroll={handleListScroll}>
                <div className="px-4 py-4">
                    {v.isEmpty ? (
                        <div className="flex min-h-50 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
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
                        <div className={gridClass}>
                            {v.visibleBooks.map((book) => (
                                <BookCard key={book.id} book={book} view={v.view} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {v.filteredCount > 0 && (
                <div className="border-t border-border/70 px-4 py-1.5">
                    <BooksPagination
                        page={v.page}
                        totalPages={v.totalPages}
                        pageSize={v.pageSize}
                        onPageChange={v.setPage}
                        onPageSizeChange={v.changePageSize}
                    />
                </div>
            )}
        </div>
    );
}
