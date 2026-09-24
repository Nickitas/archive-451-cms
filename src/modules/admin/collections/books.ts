import type { Access, CollectionConfig } from 'payload'
import type { Book } from '../payload-types'

// Личная библиотека: админ видит все книги, пользователь — только свои
const ownBooks: Access<Book> = ({ req: { user } }) => {
    if (user?.role === 'admin') {
        return true
    }

    return user ? { owner: { equals: user.id } } : false
}

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
    access: {
        read: ownBooks,
        create: ({ req: { user } }) => Boolean(user),
        update: ownBooks,
        delete: ownBooks,
    },
    // Владелец — создатель книги; админ может указать другого явно
    hooks: {
        beforeChange: [
            ({ operation, req, data }) => {
                if (operation === 'create' && req.user && !data.owner) {
                    data.owner = req.user.id
                }
            },
        ],
        // Книга уходит вместе с заметками (иначе Payload при разрыве связи зануляет notes.book_id)
        beforeDelete: [
            async ({ req, id }) => {
                await req.payload.delete({
                    collection: 'notes',
                    where: { book: { equals: id } },
                    overrideAccess: true,
                })
            },
        ],
    },
    fields: [
        {
            type: 'relationship', name: 'owner', relationTo: 'users', required: true, index: true,
            label: { ru: 'Владелец', en: 'Owner' },
        },
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
            type: "checkbox", name: "isPublic", defaultValue: true,
            label: { ru: 'Публичная (заметки в ленте)', en: 'Public (notes in feed)' },
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
