'use client';

import { useActionState } from 'react';
import { updateLibraryShareAction } from '../actions/library-share';
import { SHARE_MANAGER_STATE_INITIAL } from '../domain/share';

export function useShareManager() {
    const [state, action, pending] = useActionState(updateLibraryShareAction, SHARE_MANAGER_STATE_INITIAL);
    return { state, action, pending };
}
