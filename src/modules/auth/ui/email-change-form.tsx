'use client';

import { useActionState } from 'react';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { changeEmailAction } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';

export function EmailChangeForm() {
    const locale = useLocale();
    const t = authCopy[locale];
    const [state, action, pending] = useActionState<AuthFormState, FormData>(changeEmailAction, AUTH_FORM_STATE_INITIAL);

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="settings-email-current-password"
                name="currentPassword"
                label={t.field.currentPasswordLabel}
                type="password"
                icon={Lock}
                placeholder={t.field.passwordPlaceholder}
                autoComplete="current-password"
                errors={state.fieldErrors?.currentPassword}
            />

            <FormField
                id="settings-email"
                name="email"
                label={t.field.emailLabel}
                type="email"
                icon={Mail}
                placeholder={t.field.emailPlaceholder}
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? t.form.emailChangePending : t.form.emailChangeSubmit}
            </Button>

            {state.success && <FormMessage status="success" message={state.success} />}
            {state.error && <FormMessage status='error' message={state.error} />}
        </form>
    );
}
