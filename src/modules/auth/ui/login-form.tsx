'use client';

import { useActionState } from 'react';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { login } from '../actions/auth';
import { FormError } from './form-error';
import { FormField } from './form-field';

type LoginFormProps = {
    onSwitchMode: () => void;
};

export function LoginForm({ onSwitchMode }: LoginFormProps) {
    const [state, action, pending] = useActionState<AuthFormState, FormData>(login, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            {state.error && <FormError message={state.error} />}

            <FormField
                id="login-email"
                name="email"
                label="Почта"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />

            <FormField
                name="password"
                id="login-password"
                label="Пароль"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                autoComplete="current-password"
                errors={state.fieldErrors?.password}
            />

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? 'Входим…' : 'Войти'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                >
                    Зарегистрируйтесь
                </button>
            </p>
        </form>
    );
}
