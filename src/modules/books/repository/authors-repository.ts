import type { Payload } from 'payload';
import { authorNameKey, normalizeAuthorName } from '../domain/author';

export type AuthorWriteContext = {
    userId?: number;
    overrideAccess?: boolean;
};

export async function findOrCreateAuthor(
    payload: Payload,
    rawName: string,
    context: AuthorWriteContext,
): Promise<number> {
    const name = normalizeAuthorName(rawName);
    const nameKey = authorNameKey(name);

    if (!name || !nameKey) throw new Error('Author name is required');

    const access = context.overrideAccess === true;
    const requestUser = context.userId === undefined ? {} : { user: { id: context.userId } };
    const findExisting = () => payload.find({
        collection: 'authors',
        depth: 0,
        limit: 1,
        where: { nameKey: { equals: nameKey } },
        ...requestUser,
        overrideAccess: access,
    });

    const existing = await findExisting();
    if (existing.docs[0]) return existing.docs[0].id;

    try {
        const created = await payload.create({
            collection: 'authors',
            data: { name, nameKey },
            draft: false,
            ...requestUser,
            overrideAccess: access,
        });
        return created.id;
    } catch (error) {
        // Параллельное создание одного имени может проиграть unique-ограничению nameKey.
        const raced = await findExisting();
        if (raced.docs[0]) return raced.docs[0].id;
        throw error;
    }
}
