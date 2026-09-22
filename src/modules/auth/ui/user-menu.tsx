'use client';

import Link from 'next/link';
import { Check, Languages, LogOut, NotebookText, Settings, UserRound } from 'lucide-react';
import { useLocale } from '@/shared/i18n/locale-provider';
import { LOCALES, LOCALE_LABELS } from '@/shared/i18n/config';
import { authCopy } from '../domain/i18n';
import { logoutAction } from '../actions/auth';
import { setLocaleAction } from '../actions/locale';
import type { AuthUser } from '../domain/auth';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

// Разделы личного кабинета: href + ключ строки в словаре
const ACCOUNT_LINKS = [
    { href: '/profile', labelKey: 'profile', icon: UserRound },
    { href: '/notes', labelKey: 'notes', icon: NotebookText },
    { href: '/settings', labelKey: 'settings', icon: Settings },
] as const;

type UserMenuProps = {
    user: AuthUser;
};

export function UserMenu({ user }: UserMenuProps) {
    const locale = useLocale();
    const t = authCopy[locale];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t.userMenu.aria}
                    className="rounded-full"
                >
                    <UserRound className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                    <p className="truncate">{user.email}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                        {t.roles[user.role]}
                    </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {ACCOUNT_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                            <item.icon />
                            {t.accountNav[item.labelKey]}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    <Languages aria-hidden className="h-4 w-4" />
                    {t.userMenu.language}
                </DropdownMenuLabel>

                {LOCALES.map((item) => (
                    <DropdownMenuItem key={item} asChild>
                        <form action={setLocaleAction}>
                            <input type="hidden" name="locale" value={item} />
                            <button type="submit" className="flex w-full items-center gap-2">
                                {LOCALE_LABELS[item]}
                                {item === locale && <Check className="ml-auto h-4 w-4" />}
                            </button>
                        </form>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <form action={logoutAction}>
                    <DropdownMenuItem asChild>
                        <button type="submit" className="w-full">
                            <LogOut />
                            {t.accountNav.logout}
                        </button>
                    </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
