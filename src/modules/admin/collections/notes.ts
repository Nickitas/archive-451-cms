import type { Access, CollectionConfig } from 'payload'
import type { Note } from '../payload-types'

// Заметки скоупятся через владельца родительской книги
const ownNotes: Access<Note> = ({ req: { user } }) => {
    if (user?.role === 'admin') {
        return true
    }

    return user ? { 'book.owner': { equals: user.id } } : false
}

// Создать заметку можно только в своей книге
const canCreateNote: Access<Note> = async ({ req, data }) => {
    const { user, payload } = req

    if (!user) {
        return false
    }

    if (user.role === 'admin') {
        return true
    }

    const bookId = typeof data?.book === 'object' ? data.book.id : Number(data?.book)

    if (!Number.isInteger(bookId)) {
        return false
    }

    const { totalDocs } = await payload.count({
        collection: 'books',
        overrideAccess: true,
        where: {
            and: [{ id: { equals: bookId } }, { owner: { equals: user.id } }],
        },
    })

    return totalDocs > 0
}

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
    access: {
        read: ownNotes,
        create: canCreateNote,
        update: ownNotes,
        delete: ownNotes,
    },
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
