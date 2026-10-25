'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { MarkdownTarget } from '@/shared/markdown/obsidian';

const MarkdownTargetsContext = createContext<MarkdownTarget[]>([]);

export function MarkdownTargetProvider({ targets, children }: { targets: MarkdownTarget[]; children: ReactNode }) {
    return <MarkdownTargetsContext.Provider value={targets}>{children}</MarkdownTargetsContext.Provider>;
}

export function useMarkdownTargets(): MarkdownTarget[] {
    return useContext(MarkdownTargetsContext);
}
