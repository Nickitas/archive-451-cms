# Технический спек: стиль кода и архитектура · archive-451-cms

> Правила написания кода, архитектура и стек. Продукт и сущности — `docs/business-logic.md`,
> дизайн-система — `docs/design.md`, правила работы — `AGENTS.md`.

## 1. Стек и инфраструктура

| Слой              | Технология                                            | Версия        |
| ----------------- | ----------------------------------------------------- | ------------- |
| Фреймворк         | Next.js (App Router, Turbopack)                       | 16.3.5        |
| CMS               | Payload CMS                                           | 3.89          |
| БД                | PostgreSQL (docker)                                   | 18            |
| S3                | MinIO (docker)                                        | quay.io/minio |
| Markdown          | react-markdown + remark-gfm + @tailwindcss/typography | —             |
| UI-кит            | shadcn/ui (стиль **radix-luma**), Tailwind CSS        | 4             |
| Иконки            | lucide-react                                          | —             |
| Темы              | next-themes (class, system по умолчанию)              | —             |
| Пакетный менеджер | pnpm                                                  | 10.33         |

Alias'ы: `@/*` → `./src/*`, `@payload-config` → `./src/modules/admin/payload.config.ts`.

Docker (`docker-compose.yml`, имя проекта `archive-451-cms`): `main-db` (postgres, **5433:5432** —
порт 5432 на хосте занят нативным Postgres EnterpriseDB, см. `/Library/LaunchDaemons/postgresql-17.plist`),
`minio` (9000, консоль 9001), `createbuckets` (бакет `images`, public).
`.env`: `DATABASE_URI` (порт 5433), `PAYLOAD_SECRET` — обязательны; `S3_*` — на этап подключения MinIO-стораджа.

⚠️ **Схема БД в dev применяется через drizzle push при старте dev-сервера.** Push интерактивен:
при переименованиях коллекций он задаёт вопросы «rename or create?» и блокирует сервер.
Поэтому: старые таблицы дропать/очищать **до** старта (чеклист в `AGENTS.md`), а не через вопросы push'а.

## 2. Архитектура

### 2.1 Слои модуля `src/modules/books/`

```
compose/      books-list.tsx (сервер+Suspense), books-list-view.tsx ('use client'), book-detail.tsx (сервер)
model/        use-books-view.ts — фильтры, статусы, теги, пагинация, вид
domain/       book.ts (сущность+статусы), note.ts (сущность+плюрализация), book-filters.ts (чистая логика)
repository/   books-repository.ts — Payload Local API + маппинг в домен
ui/           book-card, book-skeleton, books-filters, books-pagination, note-card, status-badge
```

### 2.2 Правила зависимостей

```
compose → model → domain ← repository
   └──────→ ui ←──────────┘
compose → repository
```

- **domain** — чистые функции/типы, не импортирует другие слои и React.
- **ui** — domain-типы + `@/shared/*`; не знает о model/repository.
- **repository** — единственное место, где вызывается `getAppPayload` (`@/shared/payload`).
- **compose** — собирает всё; серверные async-компоненты живут только здесь.

### 2.3 Серверные/клиентские границы

- Список: серверный compose тянет данные → клиентский view (props, сериализуемые).
- Страница книги: целиком серверный рендер (`book-detail.tsx`), Markdown рендерится на сервере.
- `params` динамических маршрутов — `Promise<{ id: string }>` (Next 16), awaited; невалидный id → `notFound()`.
- Каркас (хедер, контейнер, темы) — `src/shared/components/`: `SiteHeader`, `SiteNav`, `SiteContainer`,
  `ThemeProvider`, `ThemeToggle`; `'use client'` только там, где есть интерактив/хуки.

## 3. Стиль кода

- Файлы kebab-case; отступ — 4 пробела; одинарные кавычки.
- `'use client'` — только model/ui-интерактив/compose-view; по умолчанию компонент серверный.
- Типы Payload: `import type { Book as BookDoc } from '../../admin/payload-types'` (из repository — два уровня вверх).
- Деструктуризация props + отдельный `type XxxProps`; экспортируемые функции — именованные.
- Комментарии объясняют «почему», а не «что»; на русском — допустимо и приветствуется.

## 4. Что используем / что не используем

**Используем:**
- Payload **Local API** из серверного кода (`getAppPayload` в repository) — не REST-запросы с фронта.
- Серверные компоненты для данных; клиентские — только интерактив (фильтры, темы, навигация).
- Семантические токены дизайна из `globals.css` (палитра — `docs/design.md`).
- `next/font` с кириллицей; file-конвенции Next: `src/app/icon.svg` для фавикона, метаданные в layout.
- Suspense + скелетоны для загрузки списков.

**Не используем:**
- Прямые tailwind-цвета (zinc-/amber-/indigo-…) в модулях — только токены.
- Клиентский data-fetching там, где хватает серверного рендера.
- CSS-модули, styled-components, CSS-in-JS — только Tailwind + токены.
- Новые зависимости без обсуждения.

## 5. Локализация и строки

- Все строки интерфейса — русский, прямо в JSX; словари лейблов — в domain (`BOOK_STATUS_LABELS`, `BOOKS_SORT_OPTIONS`).
- Идентификаторы (`'want' | 'reading' | 'done'`, `'grid' | 'list'`, ключи сортировки) — английские, не переводятся.
- Плюрализация — функции в domain (`pluralizeNotes`); даты — `toLocaleDateString('ru-RU')`.
- `<html lang="ru">` задан в `(app)/layout.tsx`.
- Второй язык → вынести строки в `domain/i18n.ts`, архитектуру слоёв не менять.

## 6. Какой код хотим видеть

- Слои честные: domain тестируется без React, ui переиспользуем, repository — единственная точка доступа к данным.
- Чистые функции над данными в domain (фильтрация, сортировка, плюрализация) — их легко проверить и перенести.
- Минимум состояния в клиентских компонентах; состояние view — один хук (`use-books-view`).
- Одинаковые паттерны в одинаковых ситуациях: пилюли/чипы — `rounded-full`, контейнеры — `rounded-2xl`, иконки lucide `h-4 w-4`.
- Код читается сверху вниз без прыжков: типы → компонент → суб-компоненты.
