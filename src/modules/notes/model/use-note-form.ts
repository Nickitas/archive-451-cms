'use client';

import { useActionState } from 'react';
import { NOTE_FORM_STATE_INITIAL, type NoteFormState } from '../domain/note';

export type NoteFormAction = (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;

export function useNoteForm(action: NoteFormAction) {
    const [state, formAction, pending] = useActionState<NoteFormState, FormData>(action, NOTE_FORM_STATE_INITIAL);

    return { state, formAction, pending };
}
