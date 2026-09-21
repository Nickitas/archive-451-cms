import type { Metadata } from 'next';
import { SiteContainer } from '@/shared/components/site-container';
import { ProfileView } from '@/modules/auth/compose/profile-view';

export const metadata: Metadata = {
    title: 'Профиль',
};

export default function ProfilePage() {
    return (
        <main className="flex flex-1 flex-col">
            <SiteContainer className="flex flex-1 flex-col items-center justify-center py-8">
                <ProfileView />
            </SiteContainer>
        </main>
    );
}
