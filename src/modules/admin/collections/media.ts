import type { Access, CollectionConfig } from 'payload'

// Запись — только для авторизованных; чтение публичное (обложки рендерятся через <img>)
const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

export const MediaCollection: CollectionConfig = {
    slug: "media",
    access: {
        read: () => true,
        create: isAuthenticated,
        update: isAuthenticated,
        delete: isAuthenticated,
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
    ],
    upload: true,
}
