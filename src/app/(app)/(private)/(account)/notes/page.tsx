import type { Metadata } from 'next';
import { NotebookText } from 'lucide-react';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { PagePlaceholder } from '@/shared/components/page-placeholder';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.notes };
}

export default async function NotesPage() {
    const t = authCopy[await getLocale()];

    return (
        <PagePlaceholder
            icon={NotebookText}
            title={t.notesPlaceholder.title}
            description={t.notesPlaceholder.description}
        />
    );
}
