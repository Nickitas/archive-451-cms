import type { Metadata } from 'next';
import { NotebookText } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/page-placeholder';

export const metadata: Metadata = {
    title: 'Мои заметки',
};

export default function NotesPage() {
    return (
        <main className="flex flex-1 flex-col">
            <PagePlaceholder
                icon={NotebookText}
                title="Мои заметки"
                description="Все заметки из всех книг в одном месте — с поиском и wiki-ссылками."
            />
        </main>
    );
}
