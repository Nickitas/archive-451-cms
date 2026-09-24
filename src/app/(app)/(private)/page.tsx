import type { Metadata } from 'next';
import { getLocale } from '@/shared/i18n/get-locale';
import { feedCopy } from '@/modules/feed/domain/i18n';
import { NotesFeed } from '@/modules/feed/compose/notes-feed';

export async function generateMetadata(): Promise<Metadata> {
    const t = feedCopy[await getLocale()];

    return { title: t.meta.feed };
}

export default function FeedPage() {
    return <NotesFeed />;
}
