import type { Access, CollectionConfig } from 'payload';
import { authorNameKey, normalizeAuthorName } from '@/modules/books/domain/author';
import { isAdmin } from '../access/is-admin';

const authenticated: Access = ({ req: { user } }) => Boolean(user);

export const AuthorsCollection: CollectionConfig = {
    slug: 'authors',
    labels: {
        singular: { ru: 'Автор', en: 'Author' },
        plural: { ru: 'Авторы', en: 'Authors' },
    },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'updatedAt'],
    },
    access: {
        read: () => true,
        create: authenticated,
        update: isAdmin,
        delete: isAdmin,
    },
    hooks: {
        beforeChange: [
            ({ data }) => {
                const name = normalizeAuthorName(data.name ?? '');
                return { ...data, name, nameKey: authorNameKey(name) };
            },
        ],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            index: true,
            label: { ru: 'Имя автора', en: 'Author name' },
        },
        {
            name: 'nameKey',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: { hidden: true },
            label: { ru: 'Ключ имени', en: 'Name key' },
        },
    ],
};
