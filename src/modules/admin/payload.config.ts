import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { UserCollection } from './collections/user'
import { MediaCollection } from './collections/media'
import { BooksCollection } from './collections/books'
import { NotesCollection } from './collections/notes'
import { seedMockBooks } from './seed/mock-books'


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