import { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { seedMockBooks } from '../seed/mock-books';

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
    // Уходя, пользователь забирает библиотеку: заметки и книги удаляются перед удалением профиля
    // (иначе Payload при разрыве связей пробует выставить books.owner в NULL, а колонка NOT NULL)
    hooks: {
        // Демо-наполнение: если библиотек ещё нет, новому пользователю достаются мок-книги.
        // Хук, а не экшен регистрации — чтобы срабатывал и на создании первого пользователя из админки.
        afterChange: [
            async ({ doc, operation, req }) => {
                if (operation !== 'create') {
                    return;
                }

                try {
                    await seedMockBooks(req.payload, doc.id);
                } catch (error) {
                    req.payload.logger.error({ err: error, msg: 'Не удалось засеять мок-библиотеку' });
                }
            },
        ],
        beforeDelete: [
            async ({ req, id }) => {
                const books = await req.payload.find({
                    collection: 'books',
                    where: { owner: { equals: id } },
                    limit: 0,
                    depth: 0,
                    overrideAccess: true,
                });

                for (const book of books.docs) {
                    await req.payload.delete({
                        collection: 'notes',
                        where: { book: { equals: book.id } },
                        overrideAccess: true,
                    });
                    await req.payload.delete({ collection: 'books', id: book.id, overrideAccess: true });
                }
            },
        ],
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
