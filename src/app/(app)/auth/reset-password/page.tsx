import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from '@/shared/i18n/get-locale';
import { authCopy } from '@/modules/auth/domain/i18n';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthCard } from '@/modules/auth/ui/auth-card';
import { ResetPasswordForm } from '@/modules/auth/ui/reset-password-form';

export async function generateMetadata(): Promise<Metadata> {
    const t = authCopy[await getLocale()];

    return { title: t.meta.resetPassword };
}

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const [{ token }, locale] = await Promise.all([searchParams, getLocale()]);
    const t = authCopy[locale];

    return (
        <AuthScreen>
            {token ? (
                <AuthCard title={t.reset.cardTitle} subtitle={t.reset.cardSubtitle}>
                    <div className="mt-6">
                        <ResetPasswordForm token={token} />
                    </div>
                </AuthCard>
            ) : (
                <AuthCard
                    title={t.reset.invalidTitle}
                    subtitle={t.reset.invalidSubtitle}
                >
                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
                        >
                            {t.reset.requestNewLink}
                        </Link>
                    </div>
                </AuthCard>
            )}
        </AuthScreen>
    );
}
