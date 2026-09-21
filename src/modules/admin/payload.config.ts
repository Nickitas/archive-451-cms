import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { UserCollection } from './collections/user'
import { MediaCollection } from './collections/media'
import { BooksCollection } from './collections/books'
import { NotesCollection } from './collections/notes'
import { seedMockBooks } from './seed/mock-books'

import type { EmailAdapter } from 'payload';

const consoleEmailAdapter: EmailAdapter = ({ payload }) => ({
    name: 'console',
    defaultFromAddress: 'dev@archive451.local',
    defaultFromName: 'Archive 451 (dev)',
    sendEmail: async (message) => {
        payload.logger.info({ subject: message.subject, html: message.html }, 'Письмо (dev)');
    },
});


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: UserCollection.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [UserCollection, MediaCollection, BooksCollection, NotesCollection],
    editor: lexicalEditor(),
    email: consoleEmailAdapter,
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || '',
        }
    }),
    sharp,
    plugins: [],
    onInit: async (payload) => {
        await seedMockBooks(payload)
    },
})