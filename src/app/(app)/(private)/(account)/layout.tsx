import type { ReactNode } from 'react';
import { SiteContainer } from '@/shared/components/site-container';
import { AccountNav } from '@/modules/auth/ui/account-nav';

// Каркас личного кабинета: навигация слева, контент справа; доступ уже закрывает (private)/layout
export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <main className="flex flex-1 flex-col">
            <SiteContainer className="flex flex-1 flex-col gap-6 py-8 lg:flex-row">
                <AccountNav />
                <div className="min-w-0 flex-1">{children}</div>
            </SiteContainer>
        </main>
    );
}
