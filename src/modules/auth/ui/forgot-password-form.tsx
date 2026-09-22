'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { AUTH_FORM_STATE_INITIAL, type AuthFormState } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { forgotPasswordAction } from '../actions/auth';
import { FormMessage } from './form-message';
import { FormField } from './form-field';

export function ForgotPasswordForm() {
    const locale = useLocale();
    const t = authCopy[locale];
    const [state, action, pending] = useActionState<AuthFormState, FormData>(forgotPasswordAction, AUTH_FORM_STATE_INITIAL);

    if (state.success) {
        return (
            <div className="flex flex-col gap-4">
                <FormMessage status="success" message={state.success} />
                <Link
                    href="/auth"
                    className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    {t.forgot.backToLogin}
                </Link>
            </div>
        );
    }

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="forgot-email"
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
                {pending ? t.form.forgotPending : t.form.forgotSubmit}
            </Button>
        </form>
    );
}
