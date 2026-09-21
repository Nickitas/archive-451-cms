import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthCard } from '@/modules/auth/ui/auth-card';
import { ResetPasswordForm } from '@/modules/auth/ui/reset-password-form';

export const metadata: Metadata = {
    title: 'Новый пароль',
};

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;

    return (
        <AuthScreen>
            {token ? (
                <AuthCard title="Новый пароль" subtitle="Придумайте новый пароль для входа в архив.">
                    <div className="mt-6">
                        <ResetPasswordForm token={token} />
                    </div>
                </AuthCard>
            ) : (
                <AuthCard
                    title="Ссылка недействительна"
                    subtitle="Ссылка одноразовая и действует 1 час. Запросите сброс пароля ещё раз."
                >
                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
                        >
                            Запросить новую ссылку
                        </Link>
                    </div>
                </AuthCard>
            )}
        </AuthScreen>
    );
}
