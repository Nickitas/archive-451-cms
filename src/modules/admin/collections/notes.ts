import type { CollectionConfig } from 'payload'

export const NotesCollection: CollectionConfig = {
    slug: 'notes',
    admin: {
        useAsTitle: 'title',
    },
    defaultSort: '-createdAt',
    fields: [
        {
            type: "text", name: "title", required: true,
        },
        {
            type: "relationship", name: "book", relationTo: "books", required: true,
        },
        {
            type: "textarea", name: "content", label: "Заметка (Markdown)",
        },
    ],
}
