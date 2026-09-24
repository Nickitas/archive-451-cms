import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { booksCopy } from '@/modules/books/domain/i18n';
import { BooksList } from '@/modules/books/compose/books-list';

export async function generateMetadata(): Promise<Metadata> {
    const t = booksCopy[await getLocale()];

    return { title: t.meta.library };
}

export default function LibraryPage() {
    return <BooksList />;
}
