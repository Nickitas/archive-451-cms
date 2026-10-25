import { createHash, randomBytes } from 'node:crypto';
import { getAppPayload } from '@/shared/payload';
import { isShareTokenFormatValid } from '../domain/share';

function toRequestUser(userId: number): { id: number } {
    return { id: userId };
}

function relationshipId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) return value;
    if (typeof value === 'object' && value !== null && 'id' in value) {
        const id = (value as { id?: unknown }).id;
        return typeof id === 'number' && Number.isInteger(id) ? id : null;
    }
    return null;
}

function toTokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export const SharingRepository = {
    async getManagerState(userId: number): Promise<{ active: boolean; selectedBookIds: number[] }> {
        const payload = await getAppPayload();
        const result = await payload.find({
            collection: 'library-shares',
            depth: 0,
            limit: 1,
            where: { owner: { equals: userId } },
            user: toRequestUser(userId),
            overrideAccess: false,
        });
        const share = result.docs[0];

        if (!share) return { active: false, selectedBookIds: [] };

        return {
            active: share.active ?? false,
            selectedBookIds: (share.books ?? []).flatMap((book) => {
                const id = relationshipId(book);
                return id === null ? [] : [id];
            }),
        };
    },

    async saveShare(userId: number, selectedBookIds: number[]): Promise<string> {
        const payload = await getAppPayload();
        const bookIds = [...new Set(selectedBookIds)];

        if (bookIds.length === 0 || bookIds.length > 500) {
            throw new Error('INVALID_SHARE_SELECTION');
        }

        const eligibleBooks = await payload.find({
            collection: 'books',
            depth: 0,
            limit: 0,
            pagination: false,
            where: {
                and: [
                    { id: { in: bookIds } },
                    { owner: { equals: userId } },
                    { isPublic: { equals: true } },
                ],
            },
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        if (eligibleBooks.docs.length !== bookIds.length) {
            throw new Error('INVALID_SHARE_SELECTION');
        }

        const token = randomBytes(32).toString('base64url');
        const tokenHash = toTokenHash(token);
        const existing = await payload.find({
            collection: 'library-shares',
            depth: 0,
            limit: 1,
            where: { owner: { equals: userId } },
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        if (existing.docs[0]) {
            await payload.update({
                collection: 'library-shares',
                id: existing.docs[0].id,
                data: { books: bookIds, active: true, tokenHash },
                user: toRequestUser(userId),
                overrideAccess: false,
            });
        } else {
            await payload.create({
                collection: 'library-shares',
                data: { owner: userId, books: bookIds, active: true, tokenHash },
                user: toRequestUser(userId),
                overrideAccess: false,
            });
        }

        return token;
    },

    async revokeShare(userId: number): Promise<void> {
        const payload = await getAppPayload();
        const existing = await payload.find({
            collection: 'library-shares',
            depth: 0,
            limit: 1,
            where: { owner: { equals: userId } },
            user: toRequestUser(userId),
            overrideAccess: false,
        });

        if (!existing.docs[0] || !existing.docs[0].active) return;

        await payload.update({
            collection: 'library-shares',
            id: existing.docs[0].id,
            data: { active: false },
            user: toRequestUser(userId),
            overrideAccess: false,
        });
    },

    async resolvePublicToken(token: string): Promise<{ ownerId: number; bookIds: number[] } | null> {
        if (!isShareTokenFormatValid(token)) return null;

        const payload = await getAppPayload();
        const result = await payload.find({
            collection: 'library-shares',
            depth: 0,
            limit: 1,
            where: {
                and: [{ tokenHash: { equals: toTokenHash(token) } }, { active: { equals: true } }],
            },
            // The public page reaches this path only with the high-entropy bearer token.
            overrideAccess: true,
        });
        const share = result.docs[0];
        if (!share) return null;

        const ownerId = relationshipId(share.owner);
        if (ownerId === null) return null;

        return {
            ownerId,
            bookIds: (share.books ?? []).flatMap((book) => {
                const id = relationshipId(book);
                return id === null ? [] : [id];
            }),
        };
    },
};
