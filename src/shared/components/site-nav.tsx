'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

type SiteNavLinkProps = {
    href: string;
    children: React.ReactNode;
};

export function SiteNavLink({ href, children }: SiteNavLinkProps) {
    const pathname = usePathname();
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
        >
            {children}
        </Link>
    );
}
