export function normalizeAuthorName(name: string): string {
    return name.normalize('NFKC').trim().replace(/\s+/gu, ' ');
}

export function authorNameKey(name: string): string {
    return normalizeAuthorName(name).toLowerCase();
}
