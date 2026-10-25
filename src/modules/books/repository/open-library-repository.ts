import { z } from 'zod';
import type { BookSuggestion } from '../domain/book-editor';

const SearchResponseSchema = z.object({ docs: z.array(z.unknown()) });

const SearchDocumentSchema = z.object({
    key: z.string().regex(/^\/(?:works\/OL\d+W|books\/OL\d+M)$/u),
    title: z.string().trim().min(1),
    author_name: z.array(z.string()).nullish(),
    description: z.union([z.string(), z.object({ value: z.string() })]).nullish(),
    cover_i: z.number().int().positive().nullish(),
    first_publish_year: z.number().int().positive().nullish(),
});

function descriptionText(value: string | { value: string } | null | undefined): string {
    const description = typeof value === 'string' ? value : value?.value ?? '';
    return description.trim().slice(0, 10_000);
}

function mapDocument(rawDocument: unknown): BookSuggestion | null {
    const parsed = SearchDocumentSchema.safeParse(rawDocument);
    if (!parsed.success) {
        return null;
    }

    const document = parsed.data;
    const coverUrl = document.cover_i
        ? `https://covers.openlibrary.org/b/id/${document.cover_i}-L.jpg?default=false`
        : '';

    return {
        id: document.key,
        title: document.title,
        author: document.author_name?.map((name) => name.trim()).filter((name) => name !== '').join(', ') ?? '',
        description: descriptionText(document.description),
        coverUrl,
        sourceUrl: `https://openlibrary.org${document.key}`,
        publishedYear: document.first_publish_year ?? null,
    };
}

export const OpenLibraryRepository = {
    async searchBooks(query: string, locale: 'ru' | 'en'): Promise<BookSuggestion[]> {
        const params = new URLSearchParams({
            q: query,
            fields: 'key,title,author_name,description,cover_i,first_publish_year',
            limit: '8',
            lang: locale,
        });
        const response = await fetch(`https://openlibrary.org/search.json?${params}`, {
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
                'User-Agent': 'archive-451-cms/0.1',
            },
            signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) {
            throw new Error(`Open Library search failed with status ${response.status}`);
        }

        const parsed = SearchResponseSchema.safeParse(await response.json());
        if (!parsed.success) {
            throw new Error('Open Library returned an invalid response');
        }

        return parsed.data.docs.flatMap((document) => {
            const suggestion = mapDocument(document);
            return suggestion ? [suggestion] : [];
        });
    },
};
