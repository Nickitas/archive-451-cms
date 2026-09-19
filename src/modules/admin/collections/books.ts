import type { CollectionConfig } from 'payload'

export const BooksCollection: CollectionConfig = {
    slug: 'books',
    admin: {
        useAsTitle: 'title',
    },
    fields: [
        {
            type: "text", name: "title", required: true,
        },
        {
            type: "text", name: "author",
        },
        {
            type: "textarea", name: "description",
        },
        {
            type: "upload", name: "cover", relationTo: "media",
        },
        {
            type: "text", name: "sourceUrl", label: "Ссылка на Яндекс.Книги",
        },
        {
            type: "select", name: "status", defaultValue: "want", options: [
                { label: "Хочу прочитать", value: "want" },
                { label: "Читаю", value: "reading" },
                { label: "Прочитана", value: "done" },
            ],
        },
        {
            type: "number", name: "rating", min: 0, max: 10,
        },
        {
            type: "date", name: "finishedAt", label: "Дата прочтения", admin: { position: "sidebar" },
        },
        {
            type: "array", name: "tags", fields: [
                {
                    type: "text", name: "tag", required: true,
                },
            ],
        },
    ],
}
