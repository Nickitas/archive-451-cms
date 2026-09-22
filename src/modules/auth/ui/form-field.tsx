'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { useLocale } from '@/shared/i18n/locale-provider';
import { authCopy } from '../domain/i18n';

type FormFieldProps = {
    id: string;
    name: string;
    label: string;
    type: 'email' | 'password';
    icon: LucideIcon;
    placeholder: string;
    autoComplete: string;
    errors?: string[];
};

export function FormField({ id, name, label, type, icon: Icon, placeholder, autoComplete, errors }: FormFieldProps) {
    const t = authCopy[useLocale()];
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const hasErrors = errors !== undefined && errors.length > 0;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>

            <div className="relative">
                <Icon aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={id}
                    name={name}
                    type={isPassword && visible ? 'text' : type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required
                    className={isPassword ? 'h-10 pr-10 pl-9' : 'h-10 pl-9'}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((current) => !current)}
                        aria-label={visible ? t.field.hidePassword : t.field.showPassword}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}
