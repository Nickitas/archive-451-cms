import Link from 'next/link';
import { formatDate } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';
import type { FeedItem } from '../domain/feed';

type NoteFeedCardProps = {
    item: FeedItem;
    locale: Locale;
};

export function NoteFeedCard({ item, locale }: NoteFeedCardProps) {
    return (
        <article className="rounded-2xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-border">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="min-w-0 text-xs text-muted-foreground">
                    <Link
                        href={`/books/${item.bookId}`}
                        className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                    >
                        {item.bookTitle}
                    </Link>
                    {item.bookAuthor !== '' && <span> · {item.bookAuthor}</span>}
                </p>
                <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(locale, item.createdAt)}
                </time>
            </div>

            <h3 className="mt-2 font-medium">{item.title}</h3>

            <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {item.excerpt}
            </p>

            {item.ownerEmail !== '' && (
                <p className="mt-3 text-xs text-muted-foreground/70">— {item.ownerEmail}</p>
            )}
        </article>
    );
}
