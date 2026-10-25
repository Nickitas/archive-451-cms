import Link from 'next/link';

export type NoteBacklink = {
    id: number;
    title: string;
    bookTitle: string;
};

type NoteBacklinksProps = {
    title: string;
    emptyMessage: string;
    backlinks: NoteBacklink[];
    showWhenEmpty?: boolean;
};

export function NoteBacklinks({ title, emptyMessage, backlinks, showWhenEmpty = false }: NoteBacklinksProps) {
    if (backlinks.length === 0 && !showWhenEmpty) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-border/70 bg-card/40 p-4">
            <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold">{title}</h2>
                <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {backlinks.length}
                </span>
            </div>

            {backlinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {backlinks.map((backlink) => (
                        <li key={backlink.id}>
                            <Link href={`/notes/${backlink.id}`} className="group flex flex-col rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30">
                                <span className="text-sm font-medium text-foreground group-hover:text-primary">{backlink.title}</span>
                                <span className="text-xs text-muted-foreground">{backlink.bookTitle}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
