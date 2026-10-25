import { extractObsidianReferences, normalizeWikiTarget, type MarkdownTarget } from '@/shared/markdown/obsidian';
import type { Note, NoteBookOption } from './note';

export type ObsidianTarget = MarkdownTarget & {
    kind: 'book' | 'note';
    id: number;
};

export type NoteBacklink = {
    id: number;
    title: string;
    bookTitle: string;
};

export type BacklinkIndex = Map<string, NoteBacklink[]>;

export function createObsidianTargets(books: NoteBookOption[], notes: Note[]): ObsidianTarget[] {
    return [
        ...books.map((book) => ({
            kind: 'book' as const,
            id: book.id,
            title: book.title,
            href: `/books/${book.id}`,
        })),
        ...notes.map((note) => ({
            kind: 'note' as const,
            id: note.id,
            title: note.title,
            href: `/notes/${note.id}`,
        })),
    ];
}

function backlinkTargetKey(target: Pick<ObsidianTarget, 'kind' | 'id'>): string {
    return `${target.kind}:${target.id}`;
}

export function createBacklinkIndex(notes: Note[], targets: ObsidianTarget[]): BacklinkIndex {
    const targetsByTitle = new Map<string, ObsidianTarget[]>();
    for (const target of targets) {
        const key = normalizeWikiTarget(target.title);
        targetsByTitle.set(key, [...(targetsByTitle.get(key) ?? []), target]);
    }

    const backlinks = new Map<string, NoteBacklink[]>();
    for (const note of notes) {
        const linkedTargets = new Set<string>();

        for (const reference of extractObsidianReferences(note.content)) {
            if (reference.kind !== 'wiki') {
                continue;
            }

            const matches = targetsByTitle.get(normalizeWikiTarget(reference.target));
            if (matches?.length !== 1) {
                continue;
            }

            const target = matches[0];
            if (target.kind === 'note' && target.id === note.id) {
                continue;
            }

            const key = backlinkTargetKey(target);
            if (linkedTargets.has(key)) {
                continue;
            }
            linkedTargets.add(key);
            backlinks.set(key, [
                ...(backlinks.get(key) ?? []),
                { id: note.id, title: note.title, bookTitle: note.bookTitle },
            ]);
        }
    }

    return backlinks;
}

export function getBacklinks(index: BacklinkIndex, target: ObsidianTarget): NoteBacklink[] {
    return index.get(backlinkTargetKey(target)) ?? [];
}

export function normalizeNoteTag(rawTag: string): string | null {
    const tag = rawTag.trim().replace(/^#/u, '');

    return /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(tag) ? tag : null;
}

export function filterNotesByTag(notes: Note[], rawTag: string): Note[] {
    const normalizedTag = normalizeNoteTag(rawTag);
    if (normalizedTag === null) {
        return notes;
    }

    const targetTag = normalizedTag.toLowerCase();

    return notes.filter((note) =>
        extractObsidianReferences(note.content).some(
            (reference) => reference.kind === 'tag' && reference.tag.toLowerCase() === targetTag,
        ),
    );
}
