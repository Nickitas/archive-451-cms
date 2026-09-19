import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from 'cn';
import type { Note } from '../domain/note';

type NoteCardProps = {
    note: Note;
    className?: string;
};

export function NoteCard({ note, className }: NoteCardProps) {
    const date = new Date(note.createdAt).toLocaleDateString('ru-RU', {
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
            <header className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="font-medium">{note.title}</h3>
                <time className="shrink-0 text-xs text-muted-foreground">{date}</time>
            </header>

            {note.content !== '' && (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-primary prose-blockquote:border-primary/40 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-primary prose-pre:bg-muted/50">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                </div>
            )}
        </article>
    );
}
