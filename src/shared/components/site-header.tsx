import Link from 'next/link';
import type { AuthUser } from '@/modules/auth/domain/auth';
import { UserMenu } from '@/modules/auth/ui/user-menu';
import { getLocale } from '@/shared/i18n/get-locale';
import { sharedCopy } from '@/shared/i18n/copy';
import { SiteContainer } from './site-container';
import { SiteNavLink } from './site-nav';
import { ThemeToggle } from './theme-toggle';

type SiteHeaderProps = {
    user?: AuthUser | null;
};

export async function SiteHeader({ user }: SiteHeaderProps) {
    const t = sharedCopy[await getLocale()];

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <SiteContainer className="flex h-16 items-center justify-between gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                    <img
                        src="/logo.svg"
                        alt=""
                        className="h-8 w-8 rounded-lg ring-1 ring-border/60"
                    />
                    <span className="font-heading text-base font-bold tracking-tight text-foreground">
                        Архив 451
                    </span>
                </Link>

                <nav className="flex items-center gap-1">
                    <SiteNavLink href="/">{t.nav.library}</SiteNavLink>
                    <SiteNavLink href="/admin">{t.nav.admin}</SiteNavLink>
                    <ThemeToggle />

                    {user && <UserMenu user={user} />}
                </nav>
            </SiteContainer>
        </header>
    );
}
