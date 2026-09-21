import type { Metadata } from 'next';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthView } from '@/modules/auth/compose/auth-view';

export const metadata: Metadata = {
    title: 'Вход и регистрация',
};

export default function AuthPage() {
    return (
        <AuthScreen>
            <AuthView />
        </AuthScreen>
    );
}
