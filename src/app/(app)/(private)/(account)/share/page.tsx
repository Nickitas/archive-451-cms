import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { ShareManager } from '@/modules/sharing/compose/share-manager';
import { sharingCopy } from '@/modules/sharing/domain/i18n';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return { title: sharingCopy[locale].meta.share };
}

export default function SharePage() {
    return (
        <main className="mx-auto w-full max-w-450 px-4 py-8 sm:px-6 lg:px-8">
            <ShareManager />
        </main>
    );
}
