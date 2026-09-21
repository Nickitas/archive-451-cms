'use client';

import { useActionState } from 'react';
import { KeyRound, LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { register } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';

type RegistrationFormProps = {
    onSwitchMode: () => void;
};

export function RegistrationForm({ onSwitchMode }: RegistrationFormProps) {
    const [state, action, pending] = useActionState<AuthFormState, FormData>(register, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="register-email"
                name="email"
                label="Почта"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />

            <FormField
                id="register-password"
                name="password"
                label="Пароль"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                autoComplete="new-password"
                errors={state.fieldErrors?.password}
            />

            <FormField
                id="register-password-confirm"
                name="passwordConfirm"
                label="Повторите пароль"
                type="password"
                icon={KeyRound}
                placeholder="••••••••"
                autoComplete="new-password"
                errors={state.fieldErrors?.passwordConfirm}
            />

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? 'Регистрируем…' : 'Зарегистрироваться'}
            </Button>

            {state.error && <FormMessage status='error' message={state.error} />}

            <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                >
                    Войдите
                </button>
            </p>
        </form>
    );
}
