import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type SettingsCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    children: ReactNode;
};

// Карточка-секция настроек: иконка в кольце, заголовок, контент под разделителем
export function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
    return (
        <section className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-lg shadow-black/5 sm:p-8 dark:shadow-black/30">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/25">
                    <Icon aria-hidden className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="font-heading text-base font-bold tracking-tight">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>

            <div className="mt-6 border-t border-border/70 pt-6">{children}</div>
        </section>
    );
}
