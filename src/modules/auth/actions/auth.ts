'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import type { AuthFormState } from '../domain/auth';
import { AuthRepository } from '../repository/auth-repository';

const userSchema = z.object({
    email: z.string().email('Введите корректную почту'),
    password: z.string().min(8, 'Пароль — минимум 8 символов'),
});

// Cookie сессии ставится из экшена — так же, как её ставил бы Payload REST-логин
async function setSessionCookie(token: string): Promise<void> {
    (await cookies()).set(await AuthRepository.getSessionCookie(token));
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const validatedFields = userSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const session = await AuthRepository.login(validatedFields.data);

    if (!session) {
        return { error: 'Неверная почта или пароль.' };
    }

    await setSessionCookie(session.token);
    redirect('/');
}

export async function register(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const validatedFields = userSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (passwordConfirm !== validatedFields.data.password) {
        return { fieldErrors: { passwordConfirm: ['Пароли не совпадают'] } };
    }

    const session = await AuthRepository.register(validatedFields.data);

    if (session === 'email-taken') {
        return { fieldErrors: { email: ['Пользователь с такой почтой уже зарегистрирован.'] } };
    }

    if (!session) {
        return { error: 'Не удалось зарегистрироваться. Попробуйте ещё раз.' };
    }

    await setSessionCookie(session.token);
    redirect('/');
}

// Выход: гасим cookie сессии (как это делает REST-логаут Payload) и уводим на страницу входа
export async function logoutAction(): Promise<void> {
    (await cookies()).set(await AuthRepository.getExpiredSessionCookie());
    redirect('/auth');
}
