import type { CollectionConfig } from 'payload'

export const NotesCollection: CollectionConfig = {
    slug: 'notes',
    labels: {
        singular: { ru: 'Заметка', en: 'Note' },
        plural: { ru: 'Заметки', en: 'Notes' },
    },
    admin: {
        useAsTitle: 'title',
    },
    defaultSort: '-createdAt',
    fields: [
        {
            type: "text", name: "title", required: true,
            label: { ru: 'Заголовок', en: 'Title' },
        },
        {
            type: "relationship", name: "book", relationTo: "books", required: true,
            label: { ru: 'Книга', en: 'Book' },
        },
        {
            type: "textarea", name: "content",
            label: { ru: 'Заметка (Markdown)', en: 'Note (Markdown)' },
        },
    ],
}
