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

const emailSchema = z.object({
    email: z.string().email('Введите корректную почту'),
});

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Пароль — минимум 8 символов'),
});

// Cookie сессии ставится из экшена — так же, как её ставил бы Payload REST-логин
async function setSessionCookie(token: string): Promise<void> {
    (await cookies()).set(await AuthRepository.getSessionCookie(token));
}

/**
 * Авторизация.
 * @param _state 
 * @param formData 
 * @returns 
 */
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

/**
 * Регистрация. 
 * @param _state 
 * @param formData 
 * @returns 
 */
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

/**
 * Забыл пароль. 
 * @param _state 
 * @param formData 
 * @returns success
 */
export async function forgotPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const validatedFields = emailSchema.safeParse({ email: formData.get('email') });
    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }
    await AuthRepository.requestPasswordReset(validatedFields.data.email);
    return { success: 'Если почта зарегистрирована, письмо со ссылкой уже отправлено.' };
}

/**
 * Сброс пароля по ссылке. 
 * @param _state 
 * @param formData 
 * @returns success
 */
export async function resetPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const token = String(formData.get('token') ?? '');

    const validatedFields = resetPasswordSchema.safeParse({ password: formData.get('password') });
    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');
    if (passwordConfirm !== validatedFields.data.password) {
        return { fieldErrors: { passwordConfirm: ['Пароли не совпадают'] } };
    }

    const session = await AuthRepository.resetPassword({ token, password: validatedFields.data.password });
    if (!session) {
        return { error: 'Ссылка недействительна или устарела. Запросите сброс ещё раз.' };
    }
    await setSessionCookie(session.token);
    redirect('/');
}