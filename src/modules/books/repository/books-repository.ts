import { getAppPayload } from '@/shared/payload';
import type { Payload, Where } from 'payload';
import type { Book as BookDoc, Note as NoteDoc } from '../../admin/payload-types';
import type { Book, BookStatus } from '../domain/book';
import type { Note } from '../domain/note';
import type { BookCreateInput } from '../domain/book-editor';
import { findOrCreateAuthor } from './authors-repository';
import {
    collectBookTags,
    type BooksFilters,
    type BooksPageResult,
    type BooksQuery,
    type BooksSort,
} from '../domain/book-filters';

function toBook(doc: BookDoc, notesCount: number): Book {
    const cover = typeof doc.cover === 'object' ? doc.cover : null;
    const linkedAuthors = (doc.authors ?? []).flatMap((author) =>
        typeof author === 'object' && author !== null ? [author.name] : [],
    );

    return {
        id: doc.id,
        title: doc.title,
        author: linkedAuthors.join(', ') || doc.author || '',
        description: doc.description ?? '',
        coverPath: cover?.url ?? doc.coverUrl ?? null,
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

async function countNotesByBookIds(userId: number, bookIds: number[]): Promise<Map<number, number>> {
    if (bookIds.length === 0) return new Map();

    const payload = await getAppPayload();

    const { docs } = await payload.find({
        collection: 'notes',
        depth: 0,
        limit: 0,
        pagination: false,
        select: { book: true },
        where: { book: { in: bookIds } },
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

function buildBooksWhere(filters: BooksFilters): Where {
    const conditions: Where[] = [];
    const search = filters.search.trim();

    if (search) {
        conditions.push({
            or: [
                { title: { contains: search } },
                { author: { contains: search } },
                { 'authors.name': { contains: search } },
            ],
        });
    }

    if (filters.statuses.length > 0) {
        const statusConditions: Where[] = [{ status: { in: filters.statuses } }];
        if (filters.statuses.includes('want')) statusConditions.push({ status: { exists: false } });
        conditions.push({ or: statusConditions });
    }

    if (filters.selectedTags.length > 0) {
        conditions.push({ 'tags.tag': { in: filters.selectedTags } });
    }

    if (filters.minRating > 0) {
        conditions.push({
            or: [
                { rating: { less_than_equal: 0 } },
                { rating: { exists: false } },
                { rating: { greater_than_equal: filters.minRating } },
            ],
        });
    }

    return conditions.length === 0 ? {} : { and: conditions };
}

function andWhere(where: Where, condition: Where): Where {
    return Object.keys(where).length === 0 ? condition : { and: [where, condition] };
}

const BOOK_SORT_FIELDS: Record<BooksSort, string[]> = {
    'title-asc': ['title', 'id'],
    'rating-desc': ['-rating', 'title', 'id'],
    'finished-desc': ['-finishedAt', 'title', 'id'],
    'added-desc': ['-id'],
};

function getSortSegments(sort: BooksSort): { primary: Where; secondary: Where; primarySort: string[]; secondarySort: string[] } | null {
    if (sort === 'rating-desc') {
        return {
            primary: { rating: { greater_than: 0 } },
            secondary: { or: [{ rating: { less_than_equal: 0 } }, { rating: { exists: false } }] },
            primarySort: ['-rating', 'title', 'id'],
            secondarySort: ['title', 'id'],
        };
    }

    if (sort === 'finished-desc') {
        return {
            primary: { finishedAt: { exists: true } },
            secondary: { finishedAt: { exists: false } },
            primarySort: ['-finishedAt', 'title', 'id'],
            secondarySort: ['title', 'id'],
        };
    }

    return null;
}

async function fetchBookRange(
    payload: Payload,
    userId: number,
    where: Where,
    sort: string[],
    offset: number,
    count: number,
    pageSize: number,
): Promise<BookDoc[]> {
    const docs: BookDoc[] = [];
    let nextOffset = offset;
    let remaining = count;

    while (remaining > 0) {
        const result = await payload.find({
            collection: 'books',
            depth: 1,
            where,
            sort,
            page: Math.floor(nextOffset / pageSize) + 1,
            limit: pageSize,
            user: toRequestUser(userId),
            overrideAccess: false,
        });
        const offsetInPage = nextOffset % pageSize;
        const pageDocs = result.docs.slice(offsetInPage, offsetInPage + remaining);

        if (pageDocs.length === 0) break;

        docs.push(...pageDocs);
        nextOffset += pageDocs.length;
        remaining -= pageDocs.length;
    }

    return docs;
}

// Пользователь для access-проверок: без роли, чтобы админ на фронте видел только свою библиотеку
function toRequestUser(userId: number): { id: number } {
    return { id: userId };
}

export const BooksRepository = {
    async createBook(userId: number, input: BookCreateInput): Promise<number> {
        const payload = await getAppPayload();
        const authorId = input.author.trim()
            ? await findOrCreateAuthor(payload, input.author, { userId })
            : undefined;
        const book = await payload.create({
            collection: 'books',
            data: {
                owner: userId,
                title: input.title,
                author: input.author || undefined,
                authors: authorId === undefined ? [] : [authorId],
                description: input.description || undefined,
                coverUrl: input.coverUrl || undefined,
                sourceUrl: input.sourceUrl || undefined,
                status: 'want',
                rating: 0,
                tags: [],
            },
            draft: false,
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        return book.id;
    },

    async getBooksPage(userId: number, query: BooksQuery): Promise<BooksPageResult> {
        const payload = await getAppPayload();
        const where = buildBooksWhere(query.filters);

        const [tagResult, allBooksCount] = await Promise.all([
            payload.find({
                collection: 'books',
                depth: 0,
                limit: 0,
                pagination: false,
                select: { tags: true },
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
            payload.count({
                collection: 'books',
                user: toRequestUser(userId),
                overrideAccess: false,
            }),
        ]);

        const tags = collectBookTags(tagResult.docs.flatMap((doc) => (doc.tags ?? []).map(({ tag }) => tag)));
        const segments = getSortSegments(query.filters.sort);
        let docs: BookDoc[];
        let filteredCount: number;
        let page: number;
        let totalPages: number;

        if (segments) {
            const primaryWhere = andWhere(where, segments.primary);
            const secondaryWhere = andWhere(where, segments.secondary);
            const [{ totalDocs: primaryCount }, { totalDocs: secondaryCount }] = await Promise.all([
                payload.count({
                    collection: 'books', where: primaryWhere, user: toRequestUser(userId), overrideAccess: false,
                }),
                payload.count({
                    collection: 'books', where: secondaryWhere, user: toRequestUser(userId), overrideAccess: false,
                }),
            ]);

            filteredCount = primaryCount + secondaryCount;
            totalPages = Math.max(1, Math.ceil(filteredCount / query.pageSize));
            page = Math.min(query.page, totalPages);

            const offset = (page - 1) * query.pageSize;
            const primaryOffset = Math.min(offset, primaryCount);
            const fromPrimary = Math.min(query.pageSize, Math.max(0, primaryCount - primaryOffset));
            const primaryDocs = fromPrimary > 0
                ? await fetchBookRange(
                      payload, userId, primaryWhere, segments.primarySort, primaryOffset, fromPrimary, query.pageSize,
                  )
                : [];
            const remaining = query.pageSize - primaryDocs.length;
            const secondaryOffset = Math.max(0, offset - primaryCount);
            const secondaryDocs = remaining > 0 && secondaryOffset < secondaryCount
                ? await fetchBookRange(
                      payload,
                      userId,
                      secondaryWhere,
                      segments.secondarySort,
                      secondaryOffset,
                      Math.min(remaining, secondaryCount - secondaryOffset),
                      query.pageSize,
                  )
                : [];

            docs = [...primaryDocs, ...secondaryDocs];
        } else {
            const findPage = (requestedPage: number) => payload.find({
                collection: 'books',
                depth: 1,
                where,
                sort: BOOK_SORT_FIELDS[query.filters.sort],
                page: requestedPage,
                limit: query.pageSize,
                user: toRequestUser(userId),
                overrideAccess: false,
            });
            const result = await findPage(query.page);

            filteredCount = result.totalDocs;
            totalPages = Math.max(1, Math.ceil(filteredCount / query.pageSize));
            page = Math.min(query.page, totalPages);
            docs = page === query.page ? result.docs : (await findPage(page)).docs;
        }

        const noteCounts = await countNotesByBookIds(userId, docs.map(({ id }) => id));

        return {
            books: docs.map((doc) => toBook(doc, noteCounts.get(doc.id) ?? 0)),
            tags,
            page,
            pageSize: query.pageSize,
            totalPages,
            filteredCount,
            totalCount: allBooksCount.totalDocs,
        };
    },

    async getShareCandidates(userId: number): Promise<Array<{ id: number; title: string; author: string }>> {
        const payload = await getAppPayload();
        const { docs } = await payload.find({
            collection: 'books',
            depth: 1,
            limit: 0,
            where: { isPublic: { equals: true } },
            sort: 'title',
            select: { title: true, author: true, authors: true },
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        return docs.map((doc) => {
            const authors = (doc.authors ?? []).flatMap((author) =>
                typeof author === 'object' && author !== null ? [author.name] : [],
            );
            return { id: doc.id, title: doc.title, author: authors.join(', ') || doc.author || '' };
        });
    },

    async getSharedBooks(ownerId: number, allowedBookIds: number[]): Promise<Book[]> {
        if (allowedBookIds.length === 0) return [];

        const payload = await getAppPayload();
        // Call only after an active bearer token is resolved; owner/IDs/public-state are rechecked here.
        const { docs } = await payload.find({
            collection: 'books',
            depth: 1,
            limit: 0,
            pagination: false,
            sort: 'title',
            where: {
                and: [
                    { id: { in: allowedBookIds } },
                    { owner: { equals: ownerId } },
                    { isPublic: { equals: true } },
                ],
            },
            overrideAccess: true,
        });

        return docs.map((doc) => toBook(doc, 0));
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

        const noteCounts = await countNotesByBookIds(userId, [doc.id]);
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
