import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { UserCollection } from './collections/user'
import { MediaCollection } from './collections/media'
import { AuthorsCollection } from './collections/authors'
import { LibrarySharesCollection } from './collections/library-shares'
import { BooksCollection } from './collections/books'
import { NotesCollection } from './collections/notes'
import { seedMockBooksForFirstUser } from './seed/mock-books'

import type { EmailAdapter } from 'payload';

const consoleEmailAdapter: EmailAdapter = ({ payload }) => ({
    name: 'console',
    defaultFromAddress: 'dev@archive451.local',
    defaultFromName: 'Archive 451 (dev)',
    sendEmail: async (message) => {
        payload.logger.info({ subject: message.subject, html: message.html }, 'Письмо (dev)');
    },
});

const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3Endpoint = process.env.S3_ENDPOINT;
const s3Bucket = process.env.S3_IMAGES_BUCKET || 'images';
const s3Enabled = Boolean(s3AccessKeyId && s3SecretAccessKey && s3Endpoint);


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    // Интерфейс админки: русский по умолчанию, английский — вторым языком
    i18n: {
        supportedLanguages: { ru, en },
        fallbackLanguage: 'ru',
    },
    admin: {
        user: UserCollection.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [UserCollection, MediaCollection, AuthorsCollection, BooksCollection, NotesCollection, LibrarySharesCollection],
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
    plugins: [
        s3Storage({
            enabled: s3Enabled,
            alwaysInsertFields: true,
            collections: { media: true },
            bucket: s3Bucket,
            config: {
                region: process.env.S3_REGION || 'us-east-1',
                forcePathStyle: true,
                ...(s3Endpoint ? { endpoint: s3Endpoint } : {}),
                ...(s3AccessKeyId && s3SecretAccessKey
                    ? { credentials: { accessKeyId: s3AccessKeyId, secretAccessKey: s3SecretAccessKey } }
                    : {}),
            },
        }),
    ],
    onInit: async (payload) => {
        await seedMockBooksForFirstUser(payload)
    },
})
