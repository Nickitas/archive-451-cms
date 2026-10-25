import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { notesCopy } from '@/modules/notes/domain/i18n';
import { NoteEditor } from '@/modules/notes/compose/note-editor';

type NewNotePageProps = {
    searchParams: Promise<{ bookId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = notesCopy[await getLocale()];

    return { title: t.meta.newNote };
}

export default async function NewNotePage({ searchParams }: NewNotePageProps) {
    const { bookId: rawBookId } = await searchParams;
    const parsedBookId = Number(rawBookId);
    const initialBookId = Number.isSafeInteger(parsedBookId) && parsedBookId > 0 ? parsedBookId : undefined;

    return <NoteEditor initialBookId={initialBookId} />;
}
