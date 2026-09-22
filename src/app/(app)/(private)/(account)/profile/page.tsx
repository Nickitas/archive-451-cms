import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { ProfileView } from '@/modules/auth/compose/profile-view';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.profile };
}

export default function ProfilePage() {
    return <ProfileView />;
}
