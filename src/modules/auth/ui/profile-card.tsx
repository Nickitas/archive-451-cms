import Link from 'next/link';
import { KeyRound, Mail } from 'lucide-react';
import { cn } from 'cn';
import { formatDate, pluralForm } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';
import { Button } from '@/shared/components/ui/button';
import type { AuthRole, AuthUser } from '../domain/auth';
import { authCopy } from '../domain/i18n';

// Пилюля роли — в стиле StatusBadge из модуля книг
const ROLE_STYLES: Record<AuthRole, string> = {
    admin: 'border-primary/40 bg-primary/15 text-primary',
    user: 'border-border bg-muted/60 text-muted-foreground',
};

type ProfileCardProps = {
    user: AuthUser;
    stats: { books: number; notes: number };
    locale: Locale;
};

export function ProfileCard({ user, stats, locale }: ProfileCardProps) {
    const t = authCopy[locale];

    return (
        <div className="w-full rounded-2xl border border-border/70 bg-card/60 p-6 shadow-lg shadow-black/5 sm:p-8 dark:shadow-black/30">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/25">
                    {user.email.charAt(0).toUpperCase()}
                </div>

                <p className="mt-4 max-w-full truncate font-medium">{user.email}</p>

                <span className={cn('mt-2 rounded-full border px-2 py-0.5 text-[11px] font-medium', ROLE_STYLES[user.role])}>
                    {t.roles[user.role]}
                </span>

                <p className="mt-4 text-sm text-muted-foreground">
                    {t.profile.memberSince} {formatDate(locale, user.createdAt)}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    {stats.books} {pluralForm(locale, stats.books, t.profile.books)} · {stats.notes}{' '}
                    {pluralForm(locale, stats.notes, t.profile.notes)}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/settings?tab=email">
                            <Mail aria-hidden className="h-4 w-4" />
                            {t.profile.changeEmail}
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/settings?tab=password">
                            <KeyRound aria-hidden className="h-4 w-4" />
                            {t.profile.changePassword}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
