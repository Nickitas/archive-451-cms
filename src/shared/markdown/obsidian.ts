export type MarkdownTarget = {
    title: string;
    href: string;
};

export type ObsidianReference =
    | { kind: 'wiki'; raw: string; target: string; start: number; end: number }
    | { kind: 'tag'; raw: string; tag: string; start: number; end: number };

type MarkdownNode = {
    type?: string;
    value?: string;
    url?: string;
    children?: MarkdownNode[];
    data?: { hProperties?: Record<string, unknown> };
    position?: { start?: { offset?: number }; end?: { offset?: number } };
};

type RemarkObsidianOptions = {
    targets: MarkdownTarget[];
    source: string;
};

function isEscaped(source: string, index: number): boolean {
    let backslashCount = 0;

    for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
        backslashCount += 1;
    }

    return backslashCount % 2 === 1;
}

function isTagWordCharacter(character: string | undefined): boolean {
    return character !== undefined && /[\p{L}\p{N}_]/u.test(character);
}

function isTagCharacter(character: string | undefined): boolean {
    return character !== undefined && /[\p{L}\p{N}_-]/u.test(character);
}

export function parseObsidianText(source: string): ObsidianReference[] {
    const references: ObsidianReference[] = [];
    let cursor = 0;

    while (cursor < source.length) {
        if (source.startsWith('[[', cursor) && !isEscaped(source, cursor)) {
            const closingIndex = source.indexOf(']]', cursor + 2);
            if (closingIndex > cursor + 2) {
                const target = source.slice(cursor + 2, closingIndex).trim();
                if (target !== '' && !target.includes('[')) {
                    const end = closingIndex + 2;
                    references.push({ kind: 'wiki', raw: source.slice(cursor, end), target, start: cursor, end });
                    cursor = end;
                    continue;
                }
            }
        }

        if (source[cursor] === '#' && !isEscaped(source, cursor)) {
            const previous = source[cursor - 1];
            const firstTagCharacter = source[cursor + 1];
            const hasBoundary =
                !isTagWordCharacter(previous) && previous !== '#' && previous !== '/' && previous !== '\\';
            const hasValidStart = firstTagCharacter !== undefined && /[\p{L}\p{N}]/u.test(firstTagCharacter);

            if (hasBoundary && hasValidStart) {
                let end = cursor + 2;
                while (isTagCharacter(source[end])) {
                    end += 1;
                }

                const tag = source.slice(cursor + 1, end);
                references.push({ kind: 'tag', raw: source.slice(cursor, end), tag, start: cursor, end });
                cursor = end;
                continue;
            }
        }

        cursor += 1;
    }

    return references;
}

function findRunEnd(source: string, start: number): number {
    let end = start + 1;
    while (source[end] === '`') {
        end += 1;
    }
    return end;
}

function findClosingRun(source: string, start: number, length: number): { start: number; end: number } | null {
    let cursor = start;

    while (cursor < source.length) {
        const candidate = source.indexOf('`', cursor);
        if (candidate === -1) {
            return null;
        }

        const end = findRunEnd(source, candidate);
        if (end - candidate === length && !isEscaped(source, candidate)) {
            return { start: candidate, end };
        }
        cursor = end;
    }

    return null;
}

function maskCharacters(characters: string[], start: number, end: number): void {
    for (let index = start; index < end; index += 1) {
        characters[index] = ' ';
    }
}

function hasFutureClosingRun(lines: string[], fencedLines: boolean[], startLine: number, length: number): boolean {
    for (let index = startLine; index < lines.length; index += 1) {
        if (!fencedLines[index] && findClosingRun(lines[index], 0, length) !== null) {
            return true;
        }
    }

    return false;
}

function maskInlineCode(lines: string[], fencedLines: boolean[]): string[] {
    let openDelimiter: number | null = null;

    return lines.map((line, lineIndex) => {
        if (fencedLines[lineIndex]) {
            openDelimiter = null;
            return ' '.repeat(line.length);
        }

        const characters = line.split('');
        let cursor = 0;

        if (openDelimiter !== null) {
            const closingRun = findClosingRun(line, 0, openDelimiter);
            if (closingRun === null) {
                return ' '.repeat(line.length);
            }

            maskCharacters(characters, 0, closingRun.end);
            cursor = closingRun.end;
            openDelimiter = null;
        }

        while (cursor < line.length) {
            if (line[cursor] !== '`' || isEscaped(line, cursor)) {
                cursor += 1;
                continue;
            }

            const openEnd = findRunEnd(line, cursor);
            const openLength = openEnd - cursor;
            const closingRun = findClosingRun(line, openEnd, openLength);

            if (closingRun !== null) {
                maskCharacters(characters, cursor, closingRun.end);
                cursor = closingRun.end;
                continue;
            }

            if (hasFutureClosingRun(lines, fencedLines, lineIndex + 1, openLength)) {
                maskCharacters(characters, cursor, line.length);
                openDelimiter = openLength;
                break;
            }

            cursor = openEnd;
        }

        return characters.join('');
    });
}

function findMatchingDelimiter(source: string, start: number, opening: string, closing: string): number | null {
    let depth = 0;

    for (let cursor = start; cursor < source.length; cursor += 1) {
        if (source[cursor] === '\\') {
            cursor += 1;
            continue;
        }

        if (source[cursor] === opening) {
            depth += 1;
        } else if (source[cursor] === closing) {
            depth -= 1;
            if (depth === 0) {
                return cursor;
            }
        }
    }

    return null;
}

function getReferenceDefinitions(source: string): Set<string> {
    return new Set(
        source
            .split('\n')
            .map((line) => stripMarkdownContainerPrefix(line).match(/^ {0,3}\[([^\]]+)\]:/u)?.[1])
            .filter((label): label is string => label !== undefined)
            .map((label) => label.trim().replace(/\s+/gu, ' ').toLowerCase()),
    );
}

function maskMarkdownLinks(source: string): string {
    const characters = source.split('');
    const referenceDefinitions = getReferenceDefinitions(source);

    for (const match of source.matchAll(/(?<![\p{L}\p{N}_])((?:https?:\/\/|www\.)[^\s<>]+)/giu)) {
        const start = (match.index ?? 0) + match[0].length - match[1].length;
        maskCharacters(characters, start, start + match[1].length);
    }

    for (const match of source.matchAll(/<([a-z][a-z\d+.-]{1,31}:[^<>\s]*)>/giu)) {
        const start = match.index ?? 0;
        maskCharacters(characters, start, start + match[0].length);
    }

    let lineOffset = 0;
    for (const line of source.split('\n')) {
        if (stripMarkdownContainerPrefix(line).match(/^ {0,3}\[[^\]]+\]:/u)) {
            maskCharacters(characters, lineOffset, lineOffset + line.length);
        }
        lineOffset += line.length + 1;
    }

    const scanSource = characters.join('');
    let cursor = 0;

    while (cursor < scanSource.length) {
        const isImage = scanSource[cursor] === '!' && scanSource[cursor + 1] === '[' && !isEscaped(scanSource, cursor);
        const openBracket = isImage ? cursor + 1 : cursor;
        if (scanSource[openBracket] !== '[' || isEscaped(scanSource, openBracket)) {
            cursor += 1;
            continue;
        }

        const closeBracket = findMatchingDelimiter(scanSource, openBracket, '[', ']');
        if (closeBracket === null) {
            cursor = openBracket + 1;
            continue;
        }

        let suffixStart = closeBracket + 1;
        while (suffixStart < scanSource.length && /[ \t]/u.test(scanSource[suffixStart])) {
            suffixStart += 1;
        }
        if (scanSource[suffixStart] === '\r' && scanSource[suffixStart + 1] === '\n') {
            suffixStart += 2;
            while (suffixStart < scanSource.length && /[ \t]/u.test(scanSource[suffixStart])) {
                suffixStart += 1;
            }
        } else if (scanSource[suffixStart] === '\n') {
            suffixStart += 1;
            while (suffixStart < scanSource.length && /[ \t]/u.test(scanSource[suffixStart])) {
                suffixStart += 1;
            }
        }

        let end: number | null = null;
        if (scanSource[suffixStart] === '(') {
            const closeParen = findMatchingDelimiter(scanSource, suffixStart, '(', ')');
            end = closeParen === null ? null : closeParen + 1;
        } else if (scanSource[suffixStart] === '[') {
            const closeReference = findMatchingDelimiter(scanSource, suffixStart, '[', ']');
            end = closeReference === null ? null : closeReference + 1;
        } else {
            const label = scanSource.slice(openBracket + 1, closeBracket).trim().replace(/\s+/gu, ' ').toLowerCase();
            if (referenceDefinitions.has(label)) {
                end = closeBracket + 1;
            }
        }

        if (end === null) {
            cursor = closeBracket + 1;
            continue;
        }

        maskCharacters(characters, isImage ? cursor : openBracket, end);
        cursor = end;
    }

    return characters.join('');
}

function stripMarkdownContainerPrefix(line: string): string {
    let content = line;

    while (true) {
        const prefix = content.match(/^ {0,3}> ?|^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/u)?.[0];
        if (prefix === undefined) {
            return content;
        }
        content = content.slice(prefix.length);
    }
}

function stripCodeAndMarkdownLinks(source: string): string {
    const lines = source.split('\n');
    let fence: { marker: '`' | '~'; length: number } | null = null;
    const fencedLines = lines.map(() => false);
    const withoutFences = lines.map((line, index) => {
        const content = stripMarkdownContainerPrefix(line);
        const fenceRun = content.match(/^ {0,3}(`{3,}|~{3,})/u)?.[1];

        if (fence !== null) {
            const closingRun = content.match(/^ {0,3}(`+|~+)[ \t]*$/u)?.[1];
            if (
                closingRun !== undefined &&
                closingRun[0] === fence.marker &&
                closingRun.length >= fence.length
            ) {
                fence = null;
            }
            fencedLines[index] = true;
            return ' '.repeat(line.length);
        }

        if (fenceRun !== undefined) {
            fence = { marker: fenceRun[0] as '`' | '~', length: fenceRun.length };
            fencedLines[index] = true;
            return ' '.repeat(line.length);
        }

        return line;
    });

    const codeMasked = maskInlineCode(withoutFences, fencedLines).join('\n');
    return maskMarkdownLinks(codeMasked);
}

export function extractObsidianReferences(markdown: string): ObsidianReference[] {
    return parseObsidianText(stripCodeAndMarkdownLinks(markdown));
}

export function normalizeWikiTarget(title: string): string {
    return title.trim().toLowerCase();
}

function indexTargets(targets: MarkdownTarget[]): Map<string, MarkdownTarget[]> {
    const index = new Map<string, MarkdownTarget[]>();
    for (const target of targets) {
        const key = normalizeWikiTarget(target.title);
        index.set(key, [...(index.get(key) ?? []), target]);
    }
    return index;
}

function resolveTarget(title: string, targetIndex: Map<string, MarkdownTarget[]>): MarkdownTarget | null {
    const matches = targetIndex.get(normalizeWikiTarget(title));

    return matches?.length === 1 ? matches[0] : null;
}

function textNode(value: string): MarkdownNode {
    return { type: 'text', value };
}

function linkNode(value: string, href: string, className?: string): MarkdownNode {
    return {
        type: 'link',
        url: href,
        ...(className ? { data: { hProperties: { className: [className] } } } : {}),
        children: [textNode(value)],
    };
}

function transformText(
    source: string,
    targetIndex: Map<string, MarkdownTarget[]>,
    rawSource?: string,
): MarkdownNode[] {
    let rawCursor = 0;
    const references = parseObsidianText(source).filter((reference) => {
        if (rawSource === undefined) {
            return true;
        }

        const rawIndex = rawSource.indexOf(reference.raw, rawCursor);
        if (rawIndex === -1) {
            return false;
        }

        rawCursor = rawIndex + reference.raw.length;
        return !isEscaped(rawSource, rawIndex);
    });
    if (references.length === 0) {
        return [textNode(source)];
    }

    const nodes: MarkdownNode[] = [];
    let cursor = 0;

    for (const reference of references) {
        if (reference.start > cursor) {
            nodes.push(textNode(source.slice(cursor, reference.start)));
        }

        if (reference.kind === 'wiki') {
            const target = resolveTarget(reference.target, targetIndex);
            nodes.push(target ? linkNode(reference.target, target.href, 'wiki-link') : textNode(reference.raw));
        } else {
            const href = `/notes?tag=${encodeURIComponent(reference.tag)}`;
            nodes.push(linkNode(reference.raw, href, 'note-tag-link'));
        }

        cursor = reference.end;
    }

    if (cursor < source.length) {
        nodes.push(textNode(source.slice(cursor)));
    }

    return nodes;
}

function transformNode(
    node: MarkdownNode,
    targetIndex: Map<string, MarkdownTarget[]>,
    source: string,
): MarkdownNode[] {
    if (node.type === 'link' || node.type === 'linkReference') {
        return [node];
    }

    if (node.type === 'text' && typeof node.value === 'string') {
        const startOffset = node.position?.start?.offset;
        const endOffset = node.position?.end?.offset;
        const rawSource =
            startOffset !== undefined && endOffset !== undefined ? source.slice(startOffset, endOffset) : undefined;

        return transformText(node.value, targetIndex, rawSource);
    }

    if (Array.isArray(node.children)) {
        return [
            {
                ...node,
                children: node.children.flatMap((child) => transformNode(child, targetIndex, source)),
            },
        ];
    }

    return [node];
}

export function remarkObsidian(options: RemarkObsidianOptions) {
    const targetIndex = indexTargets(options.targets);

    return (tree: unknown): void => {
        if (typeof tree !== 'object' || tree === null || !('children' in tree)) {
            return;
        }

        const root = tree as MarkdownNode;
        if (Array.isArray(root.children)) {
            root.children = root.children.flatMap((child) => transformNode(child, targetIndex, options.source));
        }
    };
}
