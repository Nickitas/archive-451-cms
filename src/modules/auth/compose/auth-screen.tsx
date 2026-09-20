import { SiteContainer } from '@/shared/components/site-container';
import { AuthView } from './auth-view';

export function AuthScreen() {
    return (
        <main className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative flex flex-1 flex-col items-center justify-center py-8">
                <AuthView />
            </SiteContainer>
        </main>
    );
}
