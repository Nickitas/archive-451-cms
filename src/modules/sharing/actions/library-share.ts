'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { getLocale } from '@/shared/i18n/get-locale';
import { sharingCopy } from '../domain/i18n';
import type { ShareManagerState } from '../domain/share';
import { SharingRepository } from '../repository/sharing-repository';

function parseBookId(value: string): number {
    return z.string().regex(/^[1-9]\d*$/u).transform(Number).refine(Number.isSafeInteger).parse(value);
}

export async function updateLibraryShareAction(
    previousState: ShareManagerState,
    formData: FormData,
): Promise<ShareManagerState> {
    const [locale, user] = await Promise.all([getLocale(), AuthRepository.me()]);
    const t = sharingCopy[locale].manager;

    if (!user) return { error: t.sessionExpired, isActive: previousState.isActive };

    if (formData.get('operation') === 'revoke') {
        try {
            await SharingRepository.revokeShare(user.id);
            revalidatePath('/share');
            return { success: t.revoked, isActive: false };
        } catch {
            return { error: t.revokeFailed, isActive: previousState.isActive };
        }
    }

    const rawBookIds = formData.getAll('bookId').filter((value): value is string => typeof value === 'string');
    let bookIds: number[];

    try {
        bookIds = z.array(z.string()).min(1).max(500).parse(rawBookIds).map(parseBookId);
    } catch {
        return {
            error: rawBookIds.length === 0 ? t.emptySelection : t.invalidSelection,
            isActive: previousState.isActive,
        };
    }

    try {
        const token = await SharingRepository.saveShare(user.id, bookIds);
        revalidatePath('/share');
        return { success: t.linkReady, sharePath: `/s/${token}`, isActive: true };
    } catch (error) {
        return {
            error: error instanceof Error && error.message === 'INVALID_SHARE_SELECTION' ? t.invalidSelection : t.saveFailed,
            isActive: previousState.isActive,
        };
    }
}
