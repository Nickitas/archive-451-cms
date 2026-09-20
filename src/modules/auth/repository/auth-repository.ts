import { AuthenticationError, generateExpiredPayloadCookie, generatePayloadCookie, LockedAuth } from 'payload';
import { headers } from 'next/headers';
import { getAppPayload } from '@/shared/payload';
import type { AuthCredentials, AuthSession, AuthUser, SessionCookie } from '../domain/auth';

// Cookie-объект в том виде, в каком его отдают генераторы Payload
type PayloadCookieObject = {
    name: string;
    value?: string;
    expires?: string;
    path?: string;
    domain?: string;
    httpOnly?: boolean;
    maxAge?: number;
    secure?: boolean;
    sameSite?: 'Lax' | 'None' | 'Strict';
};

type AuthCollectionConfig = Parameters<typeof generatePayloadCookie>[0]['collectionAuthConfig'];

// next/headers ждёт Date и sameSite в нижнем регистре — конвертируем
function toSessionCookie(cookie: PayloadCookieObject): SessionCookie {
    const SAMESITE_MAP = { Lax: 'lax', None: 'none', Strict: 'strict' } as const;

    return {
        name: cookie.name,
        value: cookie.value ?? '',
        expires: cookie.expires ? new Date(cookie.expires) : undefined,
        path: cookie.path,
        domain: cookie.domain,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite ? SAMESITE_MAP[cookie.sameSite] : undefined,
    };
}

async function getPayloadCookie(
    generate: (collectionAuthConfig: AuthCollectionConfig, cookiePrefix: string) => PayloadCookieObject,
): Promise<SessionCookie> {
    const payload = await getAppPayload();

    return toSessionCookie(generate(payload.collections.users.config.auth, payload.config.cookiePrefix ?? 'payload'));
}

export const AuthRepository = {
    // Текущий пользователь сессии; null — не авторизован
    async me(): Promise<AuthUser | null> {
        const payload = await getAppPayload();
        const { user } = await payload.auth({ headers: await headers() });

        if (!user) {
            return null;
        }

        return { id: user.id, email: user.email, role: user.role };
    },

    // Вход; null — неверная почта/пароль или блокировка после неудачных попыток
    async login({ email, password }: AuthCredentials): Promise<AuthSession | null> {
        const payload = await getAppPayload();

        try {
            const { token } = await payload.login({
                collection: 'users',
                data: { email, password },
            });

            // token может отсутствовать, если в конфиге включено removeTokenFromResponses
            if (!token) {
                return null;
            }

            return { token };
        } catch (error) {
            if (error instanceof AuthenticationError || error instanceof LockedAuth) {
                return null;
            }

            throw error;
        }
    },

    // Регистрация с авто-входом; 'email-taken' — почта уже занята, null — прочая ошибка
    async register({ email, password }: AuthCredentials): Promise<AuthSession | 'email-taken' | null> {
        const payload = await getAppPayload();

        const existing = await payload.find({
            collection: 'users',
            depth: 0,
            limit: 1,
            where: { email: { equals: email.toLowerCase() } },
        });

        if (existing.docs.length > 0) {
            return 'email-taken';
        }

        try {
            await payload.create({
                collection: 'users',
                data: { email, password, role: 'user' },
            });
        } catch {
            return null;
        }

        return AuthRepository.login({ email, password });
    },

    // Cookie сессии по правилам Payload — ровно то же, что ставит REST-логин
    getSessionCookie(token: string): Promise<SessionCookie> {
        return getPayloadCookie((collectionAuthConfig, cookiePrefix) =>
            generatePayloadCookie({ collectionAuthConfig, cookiePrefix, returnCookieAsObject: true, token }),
        );
    },

    // Просроченная cookie сессии — для выхода (как у REST-логаута Payload)
    getExpiredSessionCookie(): Promise<SessionCookie> {
        return getPayloadCookie((collectionAuthConfig, cookiePrefix) =>
            generateExpiredPayloadCookie({ collectionAuthConfig, cookiePrefix, returnCookieAsObject: true }),
        );
    },
};
