'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { getLocale } from '@/shared/i18n/get-locale';
import { notesCopy } from '../domain/i18n';
import type { NoteFormState } from '../domain/note';
import { NotesRepository } from '../repository/notes-repository';

function formString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

function positiveInteger(message: string) {
    return z
        .string()
        .min(1, message)
        .regex(/^[1-9]\d*$/, message)
        .transform(Number)
        .refine(Number.isSafeInteger, message);
}

export async function createNoteAction(_state: NoteFormState, formData: FormData): Promise<NoteFormState> {
    const [locale, user] = await Promise.all([getLocale(), AuthRepository.me()]);
    const t = notesCopy[locale];

    if (!user) {
        return { error: t.messages.sessionExpired };
    }

    const validated = z
        .object({
            title: z.string().trim().min(1, t.messages.titleRequired),
            bookId: positiveInteger(t.messages.bookRequired),
            content: z.string(),
        })
        .safeParse({
            title: formString(formData.get('title')),
            bookId: formString(formData.get('bookId')),
            content: formString(formData.get('content')),
        });

    if (!validated.success) {
        return { fieldErrors: z.flattenError(validated.error).fieldErrors };
    }

    let noteId: number | null;
    try {
        noteId = await NotesRepository.createNote({ userId: user.id, ...validated.data });
    } catch {
        return { error: t.messages.createFailed };
    }

    if (noteId === null) {
        return { fieldErrors: { bookId: [t.messages.bookUnavailable] } };
    }

    revalidatePath('/notes');
    revalidatePath(`/books/${validated.data.bookId}`);
    revalidatePath('/');
    redirect(`/notes/${noteId}`);
}

export async function updateNoteAction(_state: NoteFormState, formData: FormData): Promise<NoteFormState> {
    const [locale, user] = await Promise.all([getLocale(), AuthRepository.me()]);
    const t = notesCopy[locale];

    if (!user) {
        return { error: t.messages.sessionExpired };
    }

    const validated = z
        .object({
            noteId: positiveInteger(t.messages.noteNotFound),
            title: z.string().trim().min(1, t.messages.titleRequired),
            content: z.string(),
        })
        .safeParse({
            noteId: formString(formData.get('noteId')),
            title: formString(formData.get('title')),
            content: formString(formData.get('content')),
        });

    if (!validated.success) {
        const fieldErrors = z.flattenError(validated.error).fieldErrors;
        return { error: fieldErrors.noteId?.[0], fieldErrors: { title: fieldErrors.title } };
    }

    const updated = await NotesRepository.updateNote({ userId: user.id, ...validated.data });

    if (!updated) {
        return { error: t.messages.noteNotFound };
    }

    revalidatePath('/notes');
    revalidatePath(`/notes/${updated.id}`);
    revalidatePath(`/books/${updated.bookId}`);
    revalidatePath('/');

    return { success: t.messages.updated };
}
