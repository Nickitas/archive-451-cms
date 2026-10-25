import { notFound, redirect } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { NoteBacklinks } from '@/shared/components/note-backlinks';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { notesCopy } from '../domain/i18n';
import { createBacklinkIndex, createObsidianTargets, getBacklinks } from '../domain/obsidian';
import { NotesRepository } from '../repository/notes-repository';
import { NoteEditorClient } from './note-editor-client';

type NoteEditorProps = {
    noteId?: number;
    initialBookId?: number;
};

export async function NoteEditor({ noteId, initialBookId }: NoteEditorProps) {
    const user = await AuthRepository.me();

    if (!user) {
        redirect('/auth');
    }

    const [locale, note, context] = await Promise.all([
        getLocale(),
        noteId === undefined ? Promise.resolve(null) : NotesRepository.getNote(noteId, user.id),
        NotesRepository.getObsidianContext(user.id),
    ]);

    if (noteId !== undefined && !note) {
        notFound();
    }

    const t = notesCopy[locale];
    const selectedBookId = initialBookId !== undefined && context.books.some((book) => book.id === initialBookId)
        ? initialBookId
        : undefined;
    const targets = createObsidianTargets(context.books, context.notes);
    const backlinkIndex = createBacklinkIndex(context.notes, targets);
    const noteTarget = note ? targets.find((target) => target.kind === 'note' && target.id === note.id) : undefined;
    const backlinks = note
        ? getBacklinks(backlinkIndex, noteTarget ?? { kind: 'note', id: note.id, title: note.title, href: `/notes/${note.id}` })
        : [];

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                    {note ? t.editor.editTitle : t.editor.newTitle}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {note ? t.editor.editDescription : t.editor.newDescription}
                </p>
            </div>

            <NoteEditorClient note={note} books={context.books} initialBookId={selectedBookId} targets={targets} />
            {note && (
                <NoteBacklinks
                    title={t.editor.backlinksTitle}
                    emptyMessage={t.editor.backlinksEmpty}
                    backlinks={backlinks}
                    showWhenEmpty
                />
            )}
        </section>
    );
}
