import { getAppPayload } from '@/shared/payload';
import type { Book as BookDoc, Note as NoteDoc } from '../../admin/payload-types';
import type { Note, NoteBookOption } from '../domain/note';

function toRequestUser(userId: number): { id: number } {
    return { id: userId };
}

function toNote(doc: NoteDoc): Note {
    const book = typeof doc.book === 'object' ? doc.book : null;

    return {
        id: doc.id,
        title: doc.title,
        bookId: typeof doc.book === 'object' ? doc.book.id : doc.book,
        bookTitle: book?.title ?? '',
        content: doc.content ?? '',
        createdAt: doc.createdAt,
    };
}

function toBookOption(doc: BookDoc): NoteBookOption {
    return { id: doc.id, title: doc.title };
}

export const NotesRepository = {
    async getObsidianContext(userId: number): Promise<{ books: NoteBookOption[]; notes: Note[] }> {
        const payload = await getAppPayload();

        const [booksResult, notesResult] = await Promise.all([
            payload.find({
                collection: 'books',
                depth: 0,
                limit: 0,
                sort: 'title',
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
            payload.find({
                collection: 'notes',
                depth: 1,
                limit: 0,
                sort: '-createdAt',
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
        ]);

        return {
            books: booksResult.docs.map(toBookOption),
            notes: notesResult.docs.map(toNote),
        };
    },

    async getUserNotes(userId: number, search = ''): Promise<Note[]> {
        const payload = await getAppPayload();
        const term = search.trim();
        const { docs } = await payload.find({
            collection: 'notes',
            depth: 1,
            limit: 0,
            sort: '-createdAt',
            ...(term
                ? {
                      where: {
                          or: [
                              { title: { contains: term } },
                              { content: { contains: term } },
                              { 'book.title': { contains: term } },
                              { 'book.author': { contains: term } },
                              { 'book.authors.name': { contains: term } },
                          ],
                      },
                  }
                : {}),
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        return docs.map(toNote);
    },

    async getNote(id: number, userId: number): Promise<Note | null> {
        const payload = await getAppPayload();

        try {
            const doc = await payload.findByID({
                collection: 'notes',
                id,
                depth: 1,
                user: toRequestUser(userId),
                overrideAccess: false,
            });

            return toNote(doc);
        } catch {
            return null;
        }
    },

    async createNote({
        userId,
        bookId,
        title,
        content,
    }: {
        userId: number;
        bookId: number;
        title: string;
        content: string;
    }): Promise<number | null> {
        const payload = await getAppPayload();

        try {
            await payload.findByID({
                collection: 'books',
                id: bookId,
                user: toRequestUser(userId),
                overrideAccess: false,
            });
        } catch {
            return null;
        }

        const note = await payload.create({
            collection: 'notes',
            data: { title, book: bookId, content },
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        return note.id;
    },

    async updateNote({
        userId,
        noteId,
        title,
        content,
    }: {
        userId: number;
        noteId: number;
        title: string;
        content: string;
    }): Promise<{ id: number; bookId: number } | null> {
        const payload = await getAppPayload();

        try {
            const note = await payload.update({
                collection: 'notes',
                id: noteId,
                data: { title, content },
                depth: 0,
                user: toRequestUser(userId),
                overrideAccess: false,
            });

            return {
                id: note.id,
                bookId: typeof note.book === 'object' ? note.book.id : note.book,
            };
        } catch {
            return null;
        }
    },
};
