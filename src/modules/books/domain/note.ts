import { pluralForm } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';

import { booksCopy } from './i18n';

export type Note = {
    id: number;
    title: string;
    bookId: number;
    content: string;
    createdAt: string;
};

// «1 заметка», «2 заметки», «5 заметок» / "1 note", "2 notes"
export function pluralizeNotes(locale: Locale, count: number): string {
    return `${count} ${pluralForm(locale, count, booksCopy[locale].note.forms)}`;
}
