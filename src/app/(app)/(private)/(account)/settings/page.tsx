import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { SettingsView } from '@/modules/auth/ui/settings-view';
import type { SettingsTab } from '@/modules/auth/domain/auth';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.settings };
}

type SettingsPageProps = {
    searchParams: Promise<{ tab?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
    const [{ tab }, user] = await Promise.all([searchParams, AuthRepository.me()]);

    // Страховка: гард уже в (private)/layout
    if (!user) {
        redirect('/auth');
    }

    const initialTab: SettingsTab = tab === 'password' ? 'password' : 'email';

    return <SettingsView initialTab={initialTab} userEmail={user.email} />;
}
