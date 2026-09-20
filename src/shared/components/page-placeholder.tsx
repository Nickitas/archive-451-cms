import type { LucideIcon } from 'lucide-react';
import { SiteContainer } from './site-container';

type PagePlaceholderProps = {
    icon: LucideIcon;
    title: string;
    description: string;
};

// Заглушка раздела в стиле empty-state из дизайн-системы
export function PagePlaceholder({ icon: Icon, title, description }: PagePlaceholderProps) {
    return (
        <SiteContainer className="flex flex-1 flex-col justify-center py-8">
            <div className="flex min-h-105 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                    <Icon aria-hidden className="h-7 w-7 text-primary/70" />
                </div>

                <h1 className="font-heading text-lg font-bold tracking-tight">{title}</h1>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
        </SiteContainer>
    );
}
