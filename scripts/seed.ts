import { getPayload } from 'payload'
import config from '../src/modules/admin/payload.config'

// Ручное наполнение базы мок-книгами: `pnpm exec payload run scripts/seed.ts`.
// В этой версии payload run просто исполняет файл (default export не вызывается),
// поэтому инициализация — на верхнем уровне: getPayload отрабатывает onInit,
// и книги сеются, если коллекция пуста (см. src/modules/admin/seed/mock-books.ts).
const payload = await getPayload({ config })
const { totalDocs } = await payload.count({ collection: 'books' })
payload.logger.info(`Книг в базе: ${totalDocs}`)
