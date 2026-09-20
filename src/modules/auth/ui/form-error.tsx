type FormErrorProps = {
    message: string;
};

export function FormError({ message }: FormErrorProps) {
    return (
        <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
            {message}
        </p>
    );
}
