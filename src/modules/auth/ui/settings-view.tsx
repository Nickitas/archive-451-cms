'use client';

import { useState } from 'react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import { useLocale } from '@/shared/i18n/locale-provider';
import type { SettingsTab } from '../domain/auth';
import { authCopy } from '../domain/i18n';
import { SettingsCard } from './settings-card';
import { EmailChangeForm } from './email-change-form';
import { PasswordChangeForm } from './password-change-form';

const SETTINGS_TABS: { key: SettingsTab; labelKey: 'tabEmail' | 'tabPassword'; icon: LucideIcon }[] = [
    { key: 'email', labelKey: 'tabEmail', icon: Mail },
    { key: 'password', labelKey: 'tabPassword', icon: KeyRound },
];

type SettingsViewProps = {
    initialTab: SettingsTab;
    userEmail: string;
};

export function SettingsView({ initialTab, userEmail }: SettingsViewProps) {
    const locale = useLocale();
    const t = authCopy[locale];
    const [tab, setTab] = useState<SettingsTab>(initialTab);

    return (
        <div className="flex w-full flex-col gap-6">
            <div>
                <h1 className="font-heading text-lg font-bold tracking-tight">{t.settings.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t.settings.subtitle}</p>
            </div>

            <div
                role="group"
                aria-label={t.settings.tabsAria}
                className="flex w-fit gap-1 rounded-full border border-border/70 bg-muted/60 p-1"
            >
                {SETTINGS_TABS.map((item) => {
                    const active = tab === item.key;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            aria-pressed={active}
                            className={cn(
                                'flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Icon aria-hidden className="h-4 w-4" />
                            {t.settings[item.labelKey]}
                        </button>
                    );
                })}
            </div>

            {tab === 'email' ? (
                <SettingsCard
                    icon={Mail}
                    title={t.settings.emailCard.title}
                    description={t.settings.emailCard.description}
                >
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/60 px-3 py-2.5">
                            <span className="text-sm text-muted-foreground">{t.settings.emailCard.currentEmail}</span>
                            <span className="truncate text-sm font-medium">{userEmail}</span>
                        </div>
                        <div className="max-w-sm">
                            <EmailChangeForm />
                        </div>
                    </div>
                </SettingsCard>
            ) : (
                <SettingsCard
                    icon={KeyRound}
                    title={t.settings.passwordCard.title}
                    description={t.settings.passwordCard.description}
                >
                    <div className="flex max-w-sm flex-col gap-6">
                        <PasswordChangeForm />
                        <p className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                            {t.settings.passwordCard.hint}
                        </p>
                    </div>
                </SettingsCard>
            )}
        </div>
    );
}
