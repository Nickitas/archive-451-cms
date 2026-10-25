'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink, Link2, ShieldOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/i18n/locale-provider';
import { sharingCopy } from '../domain/i18n';
import type { ShareBookOption } from '../domain/share';
import { useShareManager } from '../model/use-share-manager';

type ShareManagerViewProps = {
    books: ShareBookOption[];
    selectedBookIds: number[];
    isActive: boolean;
};

export function ShareManagerView({ books, selectedBookIds, isActive }: ShareManagerViewProps) {
    const locale = useLocale();
    const t = sharingCopy[locale].manager;
    const { state, action, pending } = useShareManager();
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const active = state.isActive ?? isActive;

    async function copyShareLink() {
        if (!state.sharePath) return;
        try {
            await navigator.clipboard.writeText(new URL(state.sharePath, window.location.origin).toString());
            setCopied(true);
            setCopyFailed(false);
        } catch {
            setCopied(false);
            setCopyFailed(true);
        }
    }

    return (
        <section className="flex flex-col gap-6">
            <header>
                <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.description}</p>
            </header>

            <div className="rounded-2xl border border-border/70 bg-card/50 p-5">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/25">
                        {active ? <Link2 aria-hidden className="h-4 w-4" /> : <ShieldOff aria-hidden className="h-4 w-4" />}
                    </div>
                    <div>
                        <h2 className="font-semibold">{t.booksLabel}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t.privateNotice}</p>
                    </div>
                </div>

                <form action={action} className="mt-5 flex flex-col gap-4">
                    {books.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                            {t.noBooks}
                        </p>
                    ) : (
                        <fieldset className="flex flex-col gap-2">
                            <legend className="sr-only">{t.booksLabel}</legend>
                            {books.map((book) => (
                                <label
                                    key={book.id}
                                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-3 transition-colors hover:bg-muted/50"
                                >
                                    <input
                                        type="checkbox"
                                        name="bookId"
                                        value={book.id}
                                        defaultChecked={selectedBookIds.includes(book.id)}
                                        className="mt-1 h-4 w-4 shrink-0 accent-primary"
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium">{book.title}</span>
                                        {book.author !== '' && <span className="mt-0.5 block text-xs text-muted-foreground">{book.author}</span>}
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    )}

                    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
                    {state.success && <p role="status" className="text-sm text-primary">{state.success}</p>}

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" name="operation" value="save" disabled={pending || books.length === 0}>
                            <Link2 aria-hidden className="h-4 w-4" />
                            {pending ? t.updating : t.save}
                        </Button>
                        {active && (
                            <Button type="submit" name="operation" value="revoke" variant="outline" disabled={pending}>
                                <ShieldOff aria-hidden className="h-4 w-4" />
                                {pending ? t.updating : t.revoke}
                            </Button>
                        )}
                    </div>
                </form>

                <p className="mt-4 text-xs text-muted-foreground">{active ? t.active : t.inactive}</p>
                {active && !state.sharePath && <p className="mt-1 text-xs text-muted-foreground">{t.tokenUnavailable}</p>}

                {state.sharePath && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={copyShareLink}>
                            {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
                            {copied ? t.copied : t.copyLink}
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={state.sharePath} target="_blank" rel="noreferrer">
                                <ExternalLink aria-hidden className="h-4 w-4" />
                                {t.openLink}
                            </Link>
                        </Button>
                    </div>
                )}
                {copyFailed && <p role="status" className="mt-2 text-xs text-muted-foreground">{t.copyFailed}</p>}
            </div>
        </section>
    );
}
