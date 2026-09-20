import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/page-placeholder';

export const metadata: Metadata = {
    title: 'Профиль',
};

export default function ProfilePage() {
    return (
        <main className="flex flex-1 flex-col">
            <PagePlaceholder
                icon={UserRound}
                title="Профиль"
                description="Здесь появится ваш профиль: имя, почта и аватар."
            />
        </main>
    );
}
