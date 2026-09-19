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
