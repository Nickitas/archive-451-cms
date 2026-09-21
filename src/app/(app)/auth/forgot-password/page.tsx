import type { Metadata } from 'next';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthCard } from '@/modules/auth/ui/auth-card';
import { ForgotPasswordForm } from '@/modules/auth/ui/forgot-password-form';

export const metadata: Metadata = {
    title: 'Восстановление пароля',
};

export default function ForgotPasswordPage() {
    return (
        <AuthScreen>
            <AuthCard
                title="Восстановление пароля"
                subtitle="Укажите почту — пришлём ссылку для смены пароля."
            >
                <div className="mt-6">
                    <ForgotPasswordForm />
                </div>
            </AuthCard>
        </AuthScreen>
    );
}
