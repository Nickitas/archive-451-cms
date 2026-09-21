import { Flame } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export function AuthCard({
    title,
    subtitle,
    children
}: Props) {
    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-lg shadow-black/5 sm:p-8 dark:shadow-black/30">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/25">
                        <Flame aria-hidden className="h-6 w-6 text-primary" />
                    </div>

                    <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-3xl font-extrabold tracking-tight text-transparent">
                        {title}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}