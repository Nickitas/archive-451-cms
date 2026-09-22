<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Правила работы над проектом · archive-451-cms

Правила для агентов и разработчиков: как вносить изменения, писать код и что проверять.
Специализированная документация: стиль кода и архитектура — `docs/tech-specs.md`,
продукт и сущности — `docs/business-logic.md`, дизайн-система — `docs/design.md`.

| Документ                                      | Содержимое                                                    |
| --------------------------------------------- | ------------------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)                   | Правила работы: как вносить изменения, чеклисты, запреты      |
| [`docs/tech-specs.md`](tech-specs.md)         | Стек, архитектура слоёв, стиль кода, локализация              |
| [`docs/business-logic.md`](business-logic.md) | Фичи, пользователи, сущности, расчёты, дорожная карта         |
| [`docs/design.md`](design.md)                 | Дизайн-система: палитра, типографика, сетка, UI-kit, паттерны |

Кратко о проекте: читательский дневник (CMS) — личная библиотека прочитанных книг
с заметками в формате Markdown в духе Obsidian. Админка Payload — ввод данных,
фронтенд — витрина библиотеки. Название и айдентика — отсылка к «451 °F по Фаренгейту»
(саламандра и пламя).

## Как вносить изменения

1. Перед работой прочитать релевантный спек: код → `docs/tech-specs.md`, продукт → `docs/business-logic.md`, UI → `docs/design.md`.
2. Новая фича = новый модуль из пяти слоёв в `src/modules/<name>/` (см. чеклист ниже).
3. Изменение дизайна начинать с токенов в `src/app/(app)/globals.css`, компоненты переводить на них — не наоборот.
4. Документацию обновлять в том же изменении: тронул продукт → `business-logic.md`, стиль/архитектуру → `tech-specs.md`, UI → `design.md`.
5. Изменения делать минимальными и целевыми: не рефакторить то, что не относится к задаче.

## Как писать код

- Новый shadcn-компонент: `pnpm exec shadcn add <name>` → `@/shared/components/ui/`.
- После изменения коллекций Payload: `pnpm exec payload generate:types` (руками `payload-types.ts` не править).
- Цвета — только семантические токены (`bg-background`, `text-muted-foreground`…); прямые tailwind-цвета (zinc-/amber-/indigo-…) в модулях запрещены.
- Серверные async-компоненты живут только в `compose/`; данные тянутся через Payload Local API в `repository/`.
- Строки интерфейса — в словарях `domain/i18n.ts` (ru/en, ru — источник правды; см. `docs/tech-specs.md` §5); идентификаторы — на английском.

## Что проверять перед завершением

1. `pnpm exec tsc --noEmit` — нет ошибок в `src` (записи `.next/types` можно игнорировать — они перегенерируются).
2. Страницы отвечают 200: `/`, `/books/<id>`, `/admin`.
3. В `.next/dev/logs/next-development.log` нет новых ошибок.
4. Нет захардкоженных цветов: `grep -rn "zinc-\|amber-\|indigo-" src/modules src/shared` — пусто (кроме разрешённого emerald-статуса).
5. Документация обновлена (п. 4 раздела «Как вносить изменения»).

## Чеклист нового модуля (фичи)

1. Пять слоёв в `src/modules/<name>/`: `compose/`, `model/`, `domain/`, `repository/`, `ui/`.
2. Коллекция в `src/modules/admin/collections/` + `pnpm exec payload generate:types`.
3. Если коллекция новая/переименованная: **остановить dev-сервер**, дропнуть старые таблицы и их колонки в `payload_locked_documents_rels` / `payload_preferences_rels` (psql), затем стартовать dev — drizzle push отработает молча, без интерактивных вопросов.
4. Страница в `src/app/(app)/`; динамические маршруты — `params: Promise<...>` (Next 16).
5. Прогнать проверки из раздела «Что проверять».
6. Обновить документацию.

## Что делать нельзя

- Ломать направления зависимостей слоёв: `domain` не импортирует ничего из модуля; `ui` не знает о `model`/`repository` (см. `docs/tech-specs.md`).
- Вызывать `getAppPayload` где-либо, кроме `repository/`.
- Хардкодить цвета, шрифты и английские UI-строки в компонентах.
- Править `payload-types.ts` и содержимое `.next/` руками.
- Менять схему БД (переименования/дропы) при живом dev-сервере — интерактивный push заблокирует его.
- Коммитить `.env`, секреты и артефакты сборки.
- Ставить новые зависимости без явной необходимости — сначала обсудить.
- Удалять или менять блок `nextjs-agent-rules` в начале этого файла — он пересоздаётся `next dev`.
