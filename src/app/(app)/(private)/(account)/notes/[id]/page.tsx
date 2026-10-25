import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { notesCopy } from '@/modules/notes/domain/i18n';
import { NoteEditor } from '@/modules/notes/compose/note-editor';

type EditNotePageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = notesCopy[await getLocale()];

    return { title: t.meta.editNote };
}

export default async function EditNotePage({ params }: EditNotePageProps) {
    const { id } = await params;
    const noteId = Number(id);

    if (!Number.isSafeInteger(noteId) || noteId <= 0) {
        notFound();
    }

    return <NoteEditor noteId={noteId} />;
}
