import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { MarkdownContent } from '@/shared/components/markdown-content';
import { NoteBacklinks, type NoteBacklink } from '@/shared/components/note-backlinks';
import { formatDate } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';
import type { Note } from '../domain/note';
import { booksCopy } from '../domain/i18n';

type NoteCardProps = {
    note: Note;
    locale: Locale;
    backlinks: NoteBacklink[];
    className?: string;
};

export function NoteCard({ note, locale, backlinks, className }: NoteCardProps) {
    const date = formatDate(locale, note.createdAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <article
            className={cn(
                'rounded-2xl border border-border/80 bg-card/40 p-5 transition-colors hover:border-border',
                className,
            )}
        >
            <header className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-medium">{note.title}</h3>
                <div className="flex shrink-0 items-center gap-2">
                    <time className="text-xs text-muted-foreground">{date}</time>
                    <Button asChild variant="ghost" size="icon-sm">
                        <Link href={`/notes/${note.id}`} aria-label={booksCopy[locale].detail.editNote}>
                            <Pencil aria-hidden className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </header>

            {note.content !== '' && (
                <MarkdownContent content={note.content} />
            )}

            <div className="mt-4">
                <NoteBacklinks
                    title={booksCopy[locale].detail.noteBacklinksTitle}
                    emptyMessage={booksCopy[locale].detail.noteBacklinksEmpty}
                    backlinks={backlinks}
                />
            </div>
        </article>
    );
}
