import { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

export const UserCollection: CollectionConfig = {
    slug: 'users',
    labels: {
        singular: { ru: 'Пользователь', en: 'User' },
        plural: { ru: 'Пользователи', en: 'Users' },
    },
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
            label: { ru: 'Роль', en: 'Role' },
            options: [
                { label: { ru: 'Администратор', en: 'Administrator' }, value: 'admin' },
                { label: { ru: 'Читатель', en: 'Reader' }, value: 'user' },
            ],
            defaultValue: 'user',
            required: true,
            saveToJWT: true,
        }
    ],
};