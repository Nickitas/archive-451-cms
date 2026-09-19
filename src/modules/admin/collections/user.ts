import { CollectionConfig } from 'payload';

export const UserCollection: CollectionConfig = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
    },
    fields: [],
};