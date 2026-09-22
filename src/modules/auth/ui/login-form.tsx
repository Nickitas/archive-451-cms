'use client';

import { useActionState } from 'react';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { login } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';
import Link from 'next/link';

type LoginFormProps = {
    onSwitchMode: () => void;
};

export function LoginForm({ onSwitchMode }: LoginFormProps) {
    const locale = useLocale();
    const t = authCopy[locale];
    const [state, action, pending] = useActionState<AuthFormState, FormData>(login, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="login-email"
                name="email"
                label={t.field.emailLabel}
                type="email"
                icon={Mail}
                placeholder={t.field.emailPlaceholder}
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />

            <FormField
                name="password"
                id="login-password"
                label={t.field.passwordLabel}
                type="password"
                icon={Lock}
                placeholder={t.field.passwordPlaceholder}
                autoComplete="current-password"
                errors={state.fieldErrors?.password}
            />

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? t.form.loginPending : t.form.loginSubmit}
            </Button>

            {state.error && <FormMessage status='error' message={state.error} />}

            <p className="text-center text-sm text-muted-foreground">
                {t.screen.toRegisterPrompt}{' '}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                >
                    {t.screen.toRegister}
                </button>
            </p>
            <p className="text-center">
                <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    {t.screen.forgotLink}
                </Link>
            </p>
        </form>
    );
}
