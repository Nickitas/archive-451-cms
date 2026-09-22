'use client';

import { cn } from 'cn';
import { useLocale } from '@/shared/i18n/locale-provider';
import type { AuthMode } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { useAuthView } from '../model/use-auth-view';
import { LoginForm } from '../ui/login-form';
import { RegistrationForm } from '../ui/registration-form';
import { AuthCard } from '../ui/auth-card';

const AUTH_MODES: AuthMode[] = ['login', 'register'];

export function AuthView() {
    const locale = useLocale();
    const t = authCopy[locale];
    const { mode, setMode } = useAuthView();

    const copy =
        mode === 'login'
            ? { title: t.screen.loginTitle, subtitle: t.screen.loginSubtitle }
            : { title: t.screen.registerTitle, subtitle: t.screen.registerSubtitle };

    return (
        <AuthCard
            title={copy.title}
            subtitle={copy.subtitle}
        >
            <div
                role="group"
                aria-label={t.screen.toggleAria}
                className="mt-6 grid grid-cols-2 rounded-full border border-border/70 bg-muted/60 p-1"
            >
                {AUTH_MODES.map((item) => {
                    const active = mode === item;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setMode(item)}
                            aria-pressed={active}
                            className={cn(
                                'h-9 rounded-full text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {item === 'login' ? t.screen.tabLogin : t.screen.tabRegister}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6">
                {mode === 'login' ? (
                    <LoginForm onSwitchMode={() => setMode('register')} />
                ) : (
                    <RegistrationForm onSwitchMode={() => setMode('login')} />
                )}
            </div>
        </AuthCard>
    );
}
