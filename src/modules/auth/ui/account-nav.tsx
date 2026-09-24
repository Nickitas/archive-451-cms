'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, NotebookText, Settings, UserRound } from 'lucide-react';
import { cn } from 'cn';
import { useLocale } from '@/shared/i18n/locale-provider';
import { authCopy } from '../domain/i18n';
import { logoutAction } from '../actions/auth';

// Разделы личного кабинета; активность — по префиксу пути
const ACCOUNT_SECTIONS = [
    { href: '/profile', key: 'profile', icon: UserRound },
    { href: '/notes', key: 'notes', icon: NotebookText },
    { href: '/settings', key: 'settings', icon: Settings },
    { href: '/library', key: 'library', icon: BookOpen },
] as const;

export function AccountNav() {
    const locale = useLocale();
    const t = authCopy[locale];
    const pathname = usePathname();

    return (
        <nav
            aria-label={t.accountNav.aria}
            className="h-fit rounded-2xl border border-border/70 bg-card/60 p-3 lg:sticky lg:top-20 lg:w-60 lg:shrink-0"
        >
            <ul className="flex flex-col gap-1">
                {ACCOUNT_SECTIONS.map((item) => {
                    const active = pathname.startsWith(item.href);

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                )}
                            >
                                <item.icon aria-hidden className="h-4 w-4" />
                                {t.accountNav[item.key]}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-2 border-t border-border/70 pt-2">
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                        <LogOut aria-hidden className="h-4 w-4" />
                        {t.accountNav.logout}
                    </button>
                </form>
            </div>
        </nav>
    );
}
