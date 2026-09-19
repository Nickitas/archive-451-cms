import { cn } from '@/shared/lib/utils';

type SiteContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function SiteContainer({ className, ...props }: SiteContainerProps) {
    return (
        <div
            className={cn('mx-auto w-full max-w-450 px-4 sm:px-6 lg:px-8', className)}
            {...props}
        />
    );
}
