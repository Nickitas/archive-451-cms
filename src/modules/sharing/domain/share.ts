
export type SharedBookStatus = 'want' | 'reading' | 'done';

export type ShareBookOption = {
    id: number;
    title: string;
    author: string;
};

export type SharedBook = {
    id: number;
    title: string;
    author: string;
    description: string;
    coverPath: string | null;
    status: SharedBookStatus;
    rating: number;
    finishedAt: string | null;
    tags: string[];
};

export type ShareManagerState = {
    error?: string;
    success?: string;
    sharePath?: string;
    isActive?: boolean;
};

export const SHARE_MANAGER_STATE_INITIAL: ShareManagerState = {};

export function isShareTokenFormatValid(token: string): boolean {
    return /^[A-Za-z0-9_-]{43}$/u.test(token);
}
