'use client';

import { useActionState } from 'react';
import { FormField } from './form-field';
import { LoaderCircle, Mail } from 'lucide-react';
import { forgotPasswordAction } from '../actions/auth';
import { AUTH_FORM_STATE_INITIAL, AuthFormState } from '../domain/auth';
import { Button } from '@/shared/components/ui/button';
import { FormMessage } from './form-message';
import Link from 'next/link';


export function ForgotPasswordForm() {
    const [state, action, pending] = useActionState<AuthFormState, FormData>(forgotPasswordAction, AUTH_FORM_STATE_INITIAL);

    if (state.success) {
        return (
            <div className="flex flex-col gap-4">
                <FormMessage status="success" message={state.success} />
                <Link href="/auth" className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Назад ко входу
                </Link>
            </div>
        );
    }

    return (
        <form action={action} className="flex flex-col gap-4">
            <FormField
                id="forgot-email"
                name="email"
                label="Почта"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                autoComplete="email"
                errors={state.fieldErrors?.email}
            />
            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />}
                {pending ? 'Отправляем...' : 'Отправить ссылку'}
            </Button>
        </form>
    );
}