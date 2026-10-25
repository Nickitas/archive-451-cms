import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { booksCopy } from '@/modules/books/domain/i18n';
import { BooksList } from '@/modules/books/compose/books-list';
import type { BooksSearchParams } from '@/modules/books/domain/book-filters';

export async function generateMetadata(): Promise<Metadata> {
    const t = booksCopy[await getLocale()];

    return { title: t.meta.library };
}

export default function LibraryPage({ searchParams }: { searchParams: Promise<BooksSearchParams> }) {
    return <BooksList searchParams={searchParams} />;
}
