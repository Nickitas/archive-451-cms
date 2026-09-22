import { notFound } from 'next/navigation';
import { BookDetail } from '@/modules/books/compose/book-detail';

type BookPageProps = {
    params: Promise<{ id: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
    const { id } = await params;
    const bookId = Number(id);

    if (!Number.isInteger(bookId) || bookId <= 0) {
        notFound();
    }

    return <BookDetail id={bookId} />;
}
