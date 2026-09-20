import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/page-placeholder';

export const metadata: Metadata = {
    title: 'Настройки',
};

export default function SettingsPage() {
    return (
        <main className="flex flex-1 flex-col">
            <PagePlaceholder
                icon={Settings}
                title="Настройки"
                description="Тема, язык и другие параметры читательского дневника."
            />
        </main>
    );
}
