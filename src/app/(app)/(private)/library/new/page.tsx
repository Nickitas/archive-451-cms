import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { booksCopy } from '@/modules/books/domain/i18n';
import { BookEditor } from '@/modules/books/compose/book-editor';

export async function generateMetadata(): Promise<Metadata> {
    const t = booksCopy[await getLocale()];

    return { title: t.editor.metaTitle };
}

export default function NewBookPage() {
    return <BookEditor />;
}
