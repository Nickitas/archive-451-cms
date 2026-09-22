import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthCard } from '@/modules/auth/ui/auth-card';
import { ForgotPasswordForm } from '@/modules/auth/ui/forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.forgotPassword };
}

export default async function ForgotPasswordPage() {
    const t = authCopy[await getLocale()];

    return (
        <AuthScreen>
            <AuthCard
                title={t.forgot.cardTitle}
                subtitle={t.forgot.cardSubtitle}
            >
                <div className="mt-6">
                    <ForgotPasswordForm />
                </div>
            </AuthCard>
        </AuthScreen>
    );
}
