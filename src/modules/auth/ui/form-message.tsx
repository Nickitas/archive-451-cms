import { cn } from 'cn';

type FormErrorProps = {
    status?: 'error' | 'success' | 'info';
    message: string;
};

export function FormMessage({ status = 'info', message }: FormErrorProps) {
    return (
        <p
            role="alert"
            className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                status === 'error' && 'border-destructive/30 bg-destructive/10 text-destructive',
                status === 'success' && 'border-primary/30 bg-primary/10 text-primary',
            )}
        >
            {message}
        </p>
    );
}
