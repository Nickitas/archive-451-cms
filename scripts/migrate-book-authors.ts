import { getPayload } from 'payload';
import config from '../src/modules/admin/payload.config';
import { findOrCreateAuthor } from '../src/modules/books/repository/authors-repository';

const payload = await getPayload({ config });
let page = 1;
let migrated = 0;
let skipped = 0;

while (true) {
    const result = await payload.find({
        collection: 'books',
        depth: 0,
        page,
        limit: 100,
        sort: 'id',
        select: { author: true, authors: true },
        overrideAccess: true,
    });

    for (const book of result.docs) {
        if ((book.authors ?? []).length > 0 || !book.author?.trim()) {
            skipped += 1;
            continue;
        }

        // Keep a legacy author string intact as one author; never guess how commas split names.
        const authorId = await findOrCreateAuthor(payload, book.author, { overrideAccess: true });
        await payload.update({
            collection: 'books',
            id: book.id,
            data: { authors: [authorId] },
            overrideAccess: true,
        });
        migrated += 1;
    }

    if (!result.hasNextPage) break;
    page += 1;
}

payload.logger.info({ migrated, skipped }, 'Перенос авторов завершён');
