import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthView } from '@/modules/auth/compose/auth-view';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.auth };
}

export default function AuthPage() {
    return (
        <AuthScreen>
            <AuthView />
        </AuthScreen>
    );
}
