export type BookStatus = 'want' | 'reading' | 'done';

export const BOOK_STATUS_ORDER: BookStatus[] = ['want', 'reading', 'done'];

export type Book = {
    id: number;
    title: string;
    author: string;
    description: string;
    coverPath: string | null;
    sourceUrl: string;
    status: BookStatus;
    rating: number;
    finishedAt: string | null;
    tags: string[];
    notesCount: number;
};
