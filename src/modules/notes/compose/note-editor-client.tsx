'use client';

import { createNoteAction, updateNoteAction } from '../actions/notes';
import type { Note, NoteBookOption } from '../domain/note';
import type { ObsidianTarget } from '../domain/obsidian';
import { useNoteForm } from '../model/use-note-form';
import { NoteFormView } from '../ui/note-form-view';

type NoteEditorClientProps = {
    note: Note | null;
    books: NoteBookOption[];
    initialBookId?: number;
    targets: ObsidianTarget[];
};

export function NoteEditorClient({ note, books, initialBookId, targets }: NoteEditorClientProps) {
    const { state, formAction, pending } = useNoteForm(note ? updateNoteAction : createNoteAction);

    return (
        <NoteFormView
            note={note}
            books={books}
            initialBookId={initialBookId}
            targets={targets}
            state={state}
            formAction={formAction}
            pending={pending}
        />
    );
}
