import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';

// Обратный гард: авторизованным страницы /auth/* не нужны — возвращаем в библиотеку
export default async function AuthLayout({ children }: { children: ReactNode }) {
    const user = await AuthRepository.me();

    if (user) {
        redirect('/');
    }

    return children;
}
