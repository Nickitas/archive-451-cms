'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from 'cn';
import { remarkObsidian, type MarkdownTarget } from '@/shared/markdown/obsidian';
import { useMarkdownTargets } from './markdown-target-provider';

type MarkdownContentProps = {
    content: string;
    targets?: MarkdownTarget[];
    className?: string;
};

export function MarkdownContent({ content, targets, className }: MarkdownContentProps) {
    const contextTargets = useMarkdownTargets();
    const resolvedTargets = targets ?? contextTargets;

    return (
        <div className={cn('prose prose-sm max-w-none dark:prose-invert prose-a:text-primary prose-blockquote:border-primary/40 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-primary prose-pre:bg-muted/50', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm, [remarkObsidian, { targets: resolvedTargets, source: content }]]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
