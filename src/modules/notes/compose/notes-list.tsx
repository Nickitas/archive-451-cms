import { redirect } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { filterNotesByTag, normalizeNoteTag } from '../domain/obsidian';
import { NotesRepository } from '../repository/notes-repository';
import { NotesListView } from '../ui/notes-list-view';

export async function NotesList({ tag, search }: { tag?: string; search?: string }) {
    const user = await AuthRepository.me();

    if (!user) {
        redirect('/auth');
    }

    const activeSearch = search?.trim().slice(0, 200) ?? '';
    const [notes, locale] = await Promise.all([
        NotesRepository.getUserNotes(user.id, activeSearch),
        getLocale(),
    ]);
    const activeTag = tag === undefined ? null : normalizeNoteTag(tag);
    const visibleNotes = activeTag === null ? notes : filterNotesByTag(notes, activeTag);

    return <NotesListView notes={visibleNotes} locale={locale} activeTag={activeTag} search={activeSearch} />;
}
