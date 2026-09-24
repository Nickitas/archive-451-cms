import { getAppPayload } from '@/shared/payload';
import { excerptFromMarkdown } from '../domain/feed';
import type { FeedItem } from '../domain/feed';

export const FeedRepository = {
    // Публичное окно в чужие заметки: обход личного скоупа осознанный,
    // приватность обеспечивает where по book.isPublic
    async getFeed(limit = 50): Promise<FeedItem[]> {
        const payload = await getAppPayload();

        const { docs } = await payload.find({
            collection: 'notes',
            depth: 2,
            limit,
            sort: '-createdAt',
            where: { 'book.isPublic': { equals: true } },
            overrideAccess: true,
        });

        return docs.flatMap((doc) => {
            const book = typeof doc.book === 'object' ? doc.book : null;

            if (book === null) {
                return [];
            }

            const owner = typeof book.owner === 'object' ? book.owner : null;

            return [{
                id: doc.id,
                title: doc.title,
                excerpt: excerptFromMarkdown(doc.content ?? ''),
                createdAt: doc.createdAt,
                bookId: book.id,
                bookTitle: book.title,
                bookAuthor: book.author ?? '',
                ownerEmail: owner?.email ?? '',
            }];
        });
    },
};
