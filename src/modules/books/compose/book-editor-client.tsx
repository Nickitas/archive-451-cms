'use client';

import { useBookEditor } from '../model/use-book-editor';
import { BookEditorView } from '../ui/book-editor-view';

export function BookEditorClient() {
    return <BookEditorView {...useBookEditor()} />;
}
