'use client';

import { Flame } from 'lucide-react';
import { cn } from 'cn';
import { AUTH_MODE_LABELS, type AuthMode } from '../domain/auth';
import { useAuthView } from '../model/use-auth-view';
import { LoginForm } from '../ui/login-form';
import { RegistrationForm } from '../ui/registration-form';

const AUTH_MODES: AuthMode[] = ['login', 'register'];

const AUTH_SCREEN_COPY: Record<AuthMode, { title: string; subtitle: string }> = {
    login: {
        title: 'С возвращением',
        subtitle: 'Войдите, чтобы вернуться к своим книгам и заметкам.',
    },
    register: {
        title: 'Создайте аккаунт',
        subtitle: 'Ведите дневник чтения: книги, заметки и рейтинги в одном месте.',
    },
};

export function AuthView() {
    const { mode, setMode } = useAuthView();
    const copy = AUTH_SCREEN_COPY[mode];

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-lg shadow-black/5 sm:p-8 dark:shadow-black/30">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/25">
                        <Flame aria-hidden className="h-6 w-6 text-primary" />
                    </div>

                    <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-3xl font-extrabold tracking-tight text-transparent">
                        {copy.title}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
                </div>

                <div
                    role="group"
                    aria-label="Вход или регистрация"
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
                                {AUTH_MODE_LABELS[item]}
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
            </div>
        </div>
    );
}
