import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthScreen } from '@/modules/auth/compose/auth-screen';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';

export const metadata: Metadata = {
    title: 'Вход и регистрация',
};

export default async function AuthPage() {
    // Авторизованному вход/регистрация не нужны — возвращаем в библиотеку
    const user = await AuthRepository.me();

    if (user) {
        redirect('/');
    }

    return <AuthScreen />;
}
