'use client';

import { useActionState } from 'react';
import { KeyRound, LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { register } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';

type RegistrationFormProps = {
    onSwitchMode: () => void;
};

export function RegistrationForm({ onSwitchMode }: RegistrationFormProps) {
    const locale = useLocale();
    const t = authCopy[locale];
    const [state, action, pending] = useActionState<AuthFormState, FormData>(register, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="register-email"
                name="email"
                label={t.field.emailLabel}
                type="email"
                icon={Mail}
                placeholder={t.field.emailPlaceholder}
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />

            <FormField
                id="register-password"
                name="password"
                label={t.field.passwordLabel}
                type="password"
                icon={Lock}
                placeholder={t.field.passwordPlaceholder}
                autoComplete="new-password"
                errors={state.fieldErrors?.password}
            />

            <FormField
                id="register-password-confirm"
                name="passwordConfirm"
                label={t.field.passwordConfirmLabel}
                type="password"
                icon={KeyRound}
                placeholder={t.field.passwordPlaceholder}
                autoComplete="new-password"
                errors={state.fieldErrors?.passwordConfirm}
            />

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? t.form.registerPending : t.form.registerSubmit}
            </Button>

            {state.error && <FormMessage status='error' message={state.error} />}

            <p className="text-center text-sm text-muted-foreground">
                {t.screen.toLoginPrompt}{' '}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                >
                    {t.screen.toLogin}
                </button>
            </p>
        </form>
    );
}
