'use client';

import { cn } from 'cn';
import { AUTH_MODE_LABELS, type AuthMode } from '../domain/auth';
import { useAuthView } from '../model/use-auth-view';
import { LoginForm } from '../ui/login-form';
import { RegistrationForm } from '../ui/registration-form';
import { AuthCard } from '../ui/auth-card';

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
        <AuthCard
            title={copy.title}
            subtitle={copy.subtitle}
        >
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
        </AuthCard>
    );
}
