import { notFound } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { BooksRepository } from '@/modules/books/repository/books-repository';
import { SharingRepository } from '../repository/sharing-repository';
import { SharedLibraryView } from '../ui/shared-library-view';

export async function SharedLibrary({ params }: { params: Promise<{ token: string }> }) {
    const [{ token }, locale] = await Promise.all([params, getLocale()]);
    const share = await SharingRepository.resolvePublicToken(token);

    if (!share) notFound();

    const books = await BooksRepository.getSharedBooks(share.ownerId, share.bookIds);

    return (
        <SharedLibraryView
            locale={locale}
            books={books.map((book) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                coverPath: book.coverPath,
                status: book.status,
                rating: book.rating,
                finishedAt: book.finishedAt,
                tags: book.tags,
            }))}
        />
    );
}
