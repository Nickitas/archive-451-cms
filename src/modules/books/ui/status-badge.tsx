import { cn } from 'cn';
import type { BookStatus } from '../domain/book';
import { BOOK_STATUS_LABELS } from '../domain/book-filters';

const STATUS_STYLES: Record<BookStatus, string> = {
    want: 'border-border bg-muted/60 text-muted-foreground backdrop-blur-md',
    reading: 'border-primary/40 bg-primary/15 text-primary backdrop-blur-md',
    done: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 backdrop-blur-md dark:text-emerald-400',
};

export function StatusBadge({ status }: { status: BookStatus }) {
    return (
        <span
            className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                STATUS_STYLES[status],
            )}
        >
            {BOOK_STATUS_LABELS[status]}
        </span>
    );
}
