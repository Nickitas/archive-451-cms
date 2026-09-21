import { cn } from 'cn';
import { AUTH_ROLE_LABELS, type AuthRole, type AuthUser } from '../domain/auth';

// Пилюля роли — в стиле StatusBadge из модуля книг
const ROLE_STYLES: Record<AuthRole, string> = {
    admin: 'border-primary/40 bg-primary/15 text-primary',
    user: 'border-border bg-muted/60 text-muted-foreground',
};

export function ProfileCard({ user }: { user: AuthUser }) {
    return (
        <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/60 p-6 shadow-lg shadow-black/5 sm:p-8 dark:shadow-black/30">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/25">
                    {user.email.charAt(0).toUpperCase()}
                </div>

                <p className="mt-4 max-w-full truncate font-medium">{user.email}</p>

                <span className={cn('mt-2 rounded-full border px-2 py-0.5 text-[11px] font-medium', ROLE_STYLES[user.role])}>
                    {AUTH_ROLE_LABELS[user.role]}
                </span>

                <p className="mt-4 text-sm text-muted-foreground">
                    В архиве с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </p>
            </div>
        </div>
    );
}
