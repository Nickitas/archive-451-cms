import type { Metadata } from 'next';
import { SharedLibrary } from '@/modules/sharing/compose/shared-library';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function SharedLibraryPage({ params }: { params: Promise<{ token: string }> }) {
    return <SharedLibrary params={params} />;
}
