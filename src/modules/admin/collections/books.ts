import type { CollectionConfig } from 'payload'

export const BooksCollection: CollectionConfig = {
    slug: 'books',
    // Лейблы — объектами { ru, en }: админка переводит их по выбранному языку
    labels: {
        singular: { ru: 'Книга', en: 'Book' },
        plural: { ru: 'Книги', en: 'Books' },
    },
    admin: {
        useAsTitle: 'title',
    },
    fields: [
        {
            type: "text", name: "title", required: true,
            label: { ru: 'Название', en: 'Title' },
        },
        {
            type: "text", name: "author",
            label: { ru: 'Автор', en: 'Author' },
        },
        {
            type: "textarea", name: "description",
            label: { ru: 'Описание', en: 'Description' },
        },
        {
            type: "upload", name: "cover", relationTo: "media",
            label: { ru: 'Обложка', en: 'Cover' },
        },
        {
            type: "text", name: "sourceUrl",
            label: { ru: 'Ссылка на Яндекс.Книги', en: 'Yandex Books URL' },
        },
        {
            type: "select", name: "status", defaultValue: "want",
            label: { ru: 'Статус', en: 'Status' },
            options: [
                { label: { ru: 'Хочу прочитать', en: 'Want to read' }, value: "want" },
                { label: { ru: 'Читаю', en: 'Reading' }, value: "reading" },
                { label: { ru: 'Прочитана', en: 'Finished' }, value: "done" },
            ],
        },
        {
            type: "number", name: "rating", min: 0, max: 10,
            label: { ru: 'Рейтинг', en: 'Rating' },
        },
        {
            type: "date", name: "finishedAt",
            label: { ru: 'Дата прочтения', en: 'Finished at' },
            admin: { position: "sidebar" },
        },
        {
            type: "array", name: "tags",
            label: { ru: 'Теги', en: 'Tags' },
            fields: [
                {
                    type: "text", name: "tag", required: true,
                    label: { ru: 'Тег', en: 'Tag' },
                },
            ],
        },
    ],
}
