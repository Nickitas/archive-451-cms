'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getLocale } from '@/shared/i18n/get-locale';
import type { AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { AuthRepository } from '../repository/auth-repository';

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
    const t = authCopy[await getLocale()];

    const validatedFields = z
        .object({
            email: z.string().email(t.messages.invalidEmail),
            password: z.string().min(8, t.messages.passwordMinLength),
        })
        .safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const session = await AuthRepository.login(validatedFields.data);

    if (!session) {
        return { error: t.messages.wrongCredentials };
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
    const t = authCopy[await getLocale()];

    const validatedFields = z
        .object({
            email: z.string().email(t.messages.invalidEmail),
            password: z.string().min(8, t.messages.passwordMinLength),
        })
        .safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (passwordConfirm !== validatedFields.data.password) {
        return { fieldErrors: { passwordConfirm: [t.messages.passwordsMismatch] } };
    }

    const session = await AuthRepository.register(validatedFields.data);

    if (session === 'email-taken') {
        return { fieldErrors: { email: [t.messages.emailTaken] } };
    }

    if (!session) {
        return { error: t.messages.registerFailed };
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
    const t = authCopy[await getLocale()];

    const validatedFields = z
        .object({ email: z.string().email(t.messages.invalidEmail) })
        .safeParse({ email: formData.get('email') });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    await AuthRepository.requestPasswordReset(validatedFields.data.email);

    return { success: t.messages.forgotSent };
}

/**
 * Сброс пароля по ссылке.
 * @param _state
 * @param formData
 * @returns success
 */
export async function resetPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const t = authCopy[await getLocale()];
    const token = String(formData.get('token') ?? '');

    const validatedFields = z
        .object({ password: z.string().min(8, t.messages.passwordMinLength) })
        .safeParse({ password: formData.get('password') });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');
    if (passwordConfirm !== validatedFields.data.password) {
        return { fieldErrors: { passwordConfirm: [t.messages.passwordsMismatch] } };
    }

    const session = await AuthRepository.resetPassword({ token, password: validatedFields.data.password });
    if (!session) {
        return { error: t.messages.resetInvalid };
    }

    await setSessionCookie(session.token);
    redirect('/');
}

/**
 * Смена почты в настройках; текущий пароль подтверждаем входом.
 */
export async function changeEmailAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const t = authCopy[await getLocale()];

    const validatedFields = z
        .object({
            email: z.string().email(t.messages.invalidEmail),
            currentPassword: z.string().min(1, t.messages.currentPasswordRequired),
        })
        .safeParse({
            email: formData.get('email'),
            currentPassword: formData.get('currentPassword'),
        });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const user = await AuthRepository.me();
    if (!user) {
        return { error: t.messages.sessionExpired };
    }

    const verified = await AuthRepository.login({ email: user.email, password: validatedFields.data.currentPassword });
    if (!verified) {
        return { fieldErrors: { currentPassword: [t.messages.wrongCurrentPassword] } };
    }

    const updated = await AuthRepository.changeEmail({ userId: user.id, email: validatedFields.data.email });
    if (updated === 'email-taken') {
        return { fieldErrors: { email: [t.messages.emailTaken] } };
    }
    if (!updated) {
        return { error: t.messages.emailChangeFailed };
    }

    // Перевыпускаем cookie: в JWT зашита почта, она должна стать новой
    const session = await AuthRepository.login({ email: updated.email, password: validatedFields.data.currentPassword });
    if (session) {
        await setSessionCookie(session.token);
    }
    revalidatePath('/', 'layout');
    return { success: t.messages.emailChanged };
}

/**
 * Смена пароля в настройках; текущий пароль подтверждаем входом.
 */
export async function changePasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const t = authCopy[await getLocale()];

    const validatedFields = z
        .object({
            password: z.string().min(8, t.messages.passwordMinLength),
            currentPassword: z.string().min(1, t.messages.currentPasswordRequired),
        })
        .safeParse({
            password: formData.get('password'),
            currentPassword: formData.get('currentPassword'),
        });

    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');
    if (passwordConfirm !== validatedFields.data.password) {
        return { fieldErrors: { passwordConfirm: [t.messages.passwordsMismatch] } };
    }

    const user = await AuthRepository.me();
    if (!user) {
        return { error: t.messages.sessionExpired };
    }

    const verified = await AuthRepository.login({ email: user.email, password: validatedFields.data.currentPassword });
    if (!verified) {
        return { fieldErrors: { currentPassword: [t.messages.wrongCurrentPassword] } };
    }

    const saved = await AuthRepository.changePassword({ userId: user.id, password: validatedFields.data.password });
    if (!saved) {
        return { error: t.messages.passwordChangeFailed };
    }

    // Перевыпускаем cookie уже под новым паролем
    const session = await AuthRepository.login({ email: user.email, password: validatedFields.data.password });
    if (session) {
        await setSessionCookie(session.token);
    }
    revalidatePath('/', 'layout');
    return { success: t.messages.passwordChanged };
}
