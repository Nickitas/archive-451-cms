'use client';

import { useState } from 'react';
import type { AuthMode } from '../domain/auth';

// Состояние экрана авторизации: какая из двух форм сейчас открыта
export function useAuthView() {
    const [mode, setMode] = useState<AuthMode>('login');

    return { mode, setMode };
}
