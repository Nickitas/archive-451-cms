import { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

export const UserCollection: CollectionConfig = {
    slug: 'users',
    auth: true,
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