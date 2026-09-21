import { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

export const UserCollection: CollectionConfig = {
    slug: 'users',
    auth: {
        forgotPassword: {
            generateEmailSubject: () => 'Архив 451 — сброс пароля',
            generateEmailHTML: ({ token } = {}) => {
                if (!token) throw new Error('Сброс пароля: токен не сгенерирован');
                const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`;
                return `<p>Здравствуйте! Чтобы сбросить пароль, перейдите по ссылке:</p><a href="${url}">${url}</a><p>Ссылка действует 1 час.</p>`;
            },
        }
    },
    admin: {
        useAsTitle: 'email',
    },
    access: {
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
        read: () => true,
    },
    fields: [
        {
            name: 'role',
            type: 'select',
            options: ['admin', 'user'],
            defaultValue: 'user',
            required: true,
            saveToJWT: true,
        }
    ],
};