// Класс сетки плитки — общий для контента и скелетона, чтобы сетка не прыгала
export const BOOKS_GRID_CLASS =
    'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

export function BookSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/40">
            <div className="aspect-[2/3] w-full animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted/60" />
            </div>
        </div>
    );
}

// Рамка экрана библиотеки целиком: шапка + тулбар + скролл-зона + панель снизу —
// повторяет структуру BooksListView, поэтому при загрузке контент не прыгает
export function LibrarySkeleton() {
    return (
        <>
            <header className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-5">
                <div className="flex min-w-0 items-baseline gap-3">
                    <div className="h-11 w-72 animate-pulse rounded bg-muted max-sm:w-44" />
                    <div className="h-4 w-28 animate-pulse rounded bg-muted/60 max-sm:hidden" />
                </div>
                <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
            </header>

            <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2">
                <div className="h-8 min-w-52 flex-1 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted max-md:hidden" />
                <div className="h-8 w-40 animate-pulse rounded-md bg-muted max-md:hidden" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className={BOOKS_GRID_CLASS}>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <BookSkeleton key={index} />
                    ))}
                </div>
            </div>

            <div className="border-t border-border/70 px-4 py-2.5">
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
        </>
    );
}
