export type AuthMode = 'login' | 'register';

export const AUTH_MODE_LABELS: Record<AuthMode, string> = {
    login: 'Вход',
    register: 'Регистрация',
};

// Состояние формы после вызова серверного экшена; до первой отправки — AUTH_FORM_STATE_INITIAL
export type AuthFormState = {
    error?: string;
    success?: string;
    fieldErrors?: Partial<Record<'email' | 'password' | 'passwordConfirm', string[]>>;
};

export const AUTH_FORM_STATE_INITIAL: AuthFormState = {};

// Учётные данные, приходящие из форм входа и регистрации
export type AuthCredentials = {
    email: string;
    password: string;
};

// Токен сессии, который экшен кладёт в cookie по правилам Payload
export type AuthSession = {
    token: string;
};

// Роль пользователя (поле role коллекции users)
export type AuthRole = 'admin' | 'user';

export const AUTH_ROLE_LABELS: Record<AuthRole, string> = {
    admin: 'Администратор',
    user: 'Читатель',
};

// Публичные данные пользователя сессии (то, что хватает интерфейсу)
export type AuthUser = {
    id: number;
    email: string;
    role: AuthRole;
    createdAt: string;
};

// Cookie сессии, собранная так же, как её ставит Payload (REST-логин);
// sameSite — в нижнем регистре, как ждёт next/headers
export type SessionCookie = {
    name: string;
    value: string;
    expires?: Date;
    path?: string;
    domain?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'none' | 'strict';
};
