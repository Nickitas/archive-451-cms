export type Note = {
    id: number;
    title: string;
    bookId: number;
    bookTitle: string;
    content: string;
    createdAt: string;
};

export type NoteBookOption = {
    id: number;
    title: string;
};

export type NoteFormState = {
    error?: string;
    success?: string;
    fieldErrors?: Partial<Record<'title' | 'bookId', string[]>>;
};

export const NOTE_FORM_STATE_INITIAL: NoteFormState = {};
