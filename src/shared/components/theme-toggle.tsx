'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Переключить тему"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
        </Button>
    );
}
