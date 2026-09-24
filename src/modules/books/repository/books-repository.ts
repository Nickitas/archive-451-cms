import { getAppPayload } from '@/shared/payload';
import type { Book as BookDoc, Note as NoteDoc } from '../../admin/payload-types';
import type { Book, BookStatus } from '../domain/book';
import type { Note } from '../domain/note';

function toBook(doc: BookDoc, notesCount: number): Book {
    const cover = typeof doc.cover === 'object' ? doc.cover : null;

    return {
        id: doc.id,
        title: doc.title,
        author: doc.author ?? '',
        description: doc.description ?? '',
        coverPath: cover?.url ?? null,
        sourceUrl: doc.sourceUrl ?? '',
        status: (doc.status ?? 'want') as BookStatus,
        rating: doc.rating ?? 0,
        finishedAt: doc.finishedAt ?? null,
        tags: (doc.tags ?? []).map((tag) => tag.tag),
        notesCount,
        isPublic: doc.isPublic ?? true,
    };
}

function toNote(doc: NoteDoc): Note {
    return {
        id: doc.id,
        title: doc.title,
        bookId: typeof doc.book === 'object' ? doc.book.id : doc.book,
        content: doc.content ?? '',
        createdAt: doc.createdAt,
    };
}

async function countNotesByBookId(userId: number): Promise<Map<number, number>> {
    const payload = await getAppPayload();

    const { docs } = await payload.find({
        collection: 'notes',
        depth: 0,
        limit: 0,
        user: { id: userId },
        overrideAccess: false,
    });

    const counts = new Map<number, number>();
    for (const note of docs) {
        const bookId = typeof note.book === 'object' ? note.book.id : note.book;
        counts.set(bookId, (counts.get(bookId) ?? 0) + 1);
    }

    return counts;
}

// Пользователь для access-проверок: без роли, чтобы админ на фронте видел только свою библиотеку
function toRequestUser(userId: number): { id: number } {
    return { id: userId };
}

export const BooksRepository = {
    async getAllBooks(userId: number): Promise<Book[]> {
        const payload = await getAppPayload();

        const { docs } = await payload.find({
            collection: 'books',
            limit: 0,
            sort: 'title',
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        const noteCounts = await countNotesByBookId(userId);

        return docs.map((doc) => toBook(doc, noteCounts.get(doc.id) ?? 0));
    },

    async getBook(id: number, userId: number): Promise<Book | null> {
        const payload = await getAppPayload();

        let doc: BookDoc;
        try {
            doc = await payload.findByID({
                collection: 'books',
                id,
                user: toRequestUser(userId),
                overrideAccess: false,
            });
        } catch {
            return null;
        }

        const noteCounts = await countNotesByBookId(userId);
        return toBook(doc, noteCounts.get(doc.id) ?? 0);
    },

    async getBookNotes(bookId: number, userId: number): Promise<Note[]> {
        const payload = await getAppPayload();

        const { docs } = await payload.find({
            collection: 'notes',
            depth: 0,
            limit: 0,
            where: { book: { equals: bookId } },
            sort: '-createdAt',
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        return docs.map(toNote);
    },

    // Счётчики для карточки профиля в ЛК
    async getLibraryStats(userId: number): Promise<{ books: number; notes: number }> {
        const payload = await getAppPayload();

        const [books, notes] = await Promise.all([
            payload.count({
                collection: 'books',
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
            payload.count({
                collection: 'notes',
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
        ]);

        return { books: books.totalDocs, notes: notes.totalDocs };
    },
};
