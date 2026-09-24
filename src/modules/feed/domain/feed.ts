export type FeedItem = {
    id: number;
    title: string;
    excerpt: string;
    createdAt: string;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    ownerEmail: string;
};

// Короткая выдержка из Markdown-заметки: без кода, картинок и разметки
export function excerptFromMarkdown(markdown: string, max = 180): string {
    const text = markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*[-+*]\s+/gm, '')
        .replace(/[>*_~`|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}
