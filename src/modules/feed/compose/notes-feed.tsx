import { Newspaper } from 'lucide-react';
import { SiteContainer } from '@/shared/components/site-container';
import { getLocale } from '@/shared/i18n/get-locale';
import { PagePlaceholder } from '@/shared/components/page-placeholder';
import { FeedRepository } from '../repository/feed-repository';
import { feedCopy } from '../domain/i18n';
import { NoteFeedCard } from '../ui/note-feed-card';

export async function NotesFeed() {
    const locale = await getLocale();
    const t = feedCopy[locale];
    const items = await FeedRepository.getFeed();

    return (
        <main className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,86,33,0.07),transparent)]"
            />

            <SiteContainer className="relative py-8">
                <div className="mx-auto flex w-full max-w-2xl flex-col">
                    <header className="mb-6">
                        <h1 className="bg-linear-to-r from-foreground via-foreground to-foreground/45 bg-clip-text font-heading text-4xl font-extrabold tracking-tight text-transparent">
                            {t.title}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
                    </header>

                    {items.length === 0 ? (
                        <PagePlaceholder
                            icon={Newspaper}
                            title={t.emptyTitle}
                            description={t.emptyDescription}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            {items.map((item) => (
                                <NoteFeedCard key={item.id} item={item} locale={locale} />
                            ))}
                        </div>
                    )}
                </div>
            </SiteContainer>
        </main>
    );
}
