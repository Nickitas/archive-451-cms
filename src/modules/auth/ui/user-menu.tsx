'use client';

import Link from 'next/link';
import { LogOut, NotebookText, Settings, UserRound } from 'lucide-react';
import { logoutAction } from '../actions/auth';
import { AUTH_ROLE_LABELS, type AuthUser } from '../domain/auth';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

// Разделы личного кабинета
const ACCOUNT_LINKS = [
    { href: '/profile', label: 'Профиль', icon: UserRound },
    { href: '/notes', label: 'Мои заметки', icon: NotebookText },
    { href: '/settings', label: 'Настройки', icon: Settings },
] as const;

type UserMenuProps = {
    user: AuthUser;
};

export function UserMenu({ user }: UserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Меню личного кабинета"
                    className="rounded-full"
                >
                    <UserRound className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                    <p className="truncate">{user.email}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                        {AUTH_ROLE_LABELS[user.role]}
                    </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {ACCOUNT_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                            <item.icon />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <form action={logoutAction}>
                    <DropdownMenuItem asChild>
                        <button type="submit" className="w-full">
                            <LogOut />
                            Выйти
                        </button>
                    </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
