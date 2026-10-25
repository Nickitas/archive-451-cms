import type { Access, CollectionConfig } from 'payload';

function relationId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) return value;
    if (typeof value === 'object' && value !== null && 'id' in value) {
        const id = (value as { id?: unknown }).id;
        return typeof id === 'number' && Number.isInteger(id) ? id : null;
    }
    return null;
}

const ownShare: Access = ({ req: { user } }) => {
    if (user?.role === 'admin') return true;
    return user ? { owner: { equals: user.id } } : false;
};

const createOwnShare: Access = ({ req: { user }, data }) =>
    Boolean(user && (user.role === 'admin' || relationId(data?.owner) === user.id));

export const LibrarySharesCollection: CollectionConfig = {
    slug: 'library-shares',
    labels: {
        singular: { ru: 'Ссылка на библиотеку', en: 'Library share' },
        plural: { ru: 'Ссылки на библиотеки', en: 'Library shares' },
    },
    admin: {
        hidden: true,
        useAsTitle: 'owner',
    },
    access: {
        read: ownShare,
        create: createOwnShare,
        update: ownShare,
        delete: ownShare,
    },
    fields: [
        {
            name: 'owner',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            unique: true,
            index: true,
            label: { ru: 'Владелец', en: 'Owner' },
        },
        {
            name: 'tokenHash',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: { hidden: true },
            label: { ru: 'Хеш ссылки', en: 'Share token hash' },
        },
        {
            name: 'active',
            type: 'checkbox',
            defaultValue: false,
            required: true,
            label: { ru: 'Активна', en: 'Active' },
        },
        {
            name: 'books',
            type: 'relationship',
            relationTo: 'books',
            hasMany: true,
            label: { ru: 'Книги', en: 'Books' },
        },
    ],
};
