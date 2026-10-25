import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { notesCopy } from '@/modules/notes/domain/i18n';
import { NotesList } from '@/modules/notes/compose/notes-list';

type NotesPageProps = {
    searchParams: Promise<{ tag?: string | string[]; q?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = notesCopy[await getLocale()];

    return { title: t.meta.notes };
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
    const { tag: rawTag, q: rawQuery } = await searchParams;
    const tag = Array.isArray(rawTag) ? rawTag[0] : rawTag;
    const search = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;

    return <NotesList tag={tag} search={search} />;
}
