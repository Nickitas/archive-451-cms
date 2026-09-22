'use client';

import { useActionState } from 'react';
import { KeyRound, LoaderCircle, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { resetPasswordAction } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';

type ResetPasswordFormProps = {
    // Токен из ссылки сброса: страница достаёт его из searchParams и передаёт сюда
    token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const locale = useLocale();
    const t = authCopy[locale];
    const [state, action, pending] = useActionState<AuthFormState, FormData>(resetPasswordAction, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="token" value={token} />

            <FormField
                id="reset-password"
                name="password"
                label={t.field.newPasswordLabel}
                type="password"
                icon={Lock}
                placeholder={t.field.passwordPlaceholder}
                autoComplete="new-password"
                errors={state.fieldErrors?.password}
            />

            <FormField
                id="reset-password-confirm"
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
                {pending ? t.form.resetPending : t.form.resetSubmit}
            </Button>

            {state.error && <FormMessage status='error' message={state.error} />}
        </form>
    );
}
