export type AuthMode = 'login' | 'register';

// Состояние формы после вызова серверного экшена; до первой отправки — AUTH_FORM_STATE_INITIAL
export type AuthFormState = {
    error?: string;
    success?: string;
    fieldErrors?: Partial<Record<'email' | 'password' | 'passwordConfirm' | 'currentPassword', string[]>>;
};

export const AUTH_FORM_STATE_INITIAL: AuthFormState = {};

// Вкладки экрана настроек (смена почты / смена пароля)
export type SettingsTab = 'email' | 'password';

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
