# Дизайн-система · archive-451-cms

> Один стиль на весь проект: направление «Современный контраст» — терракотовый акцент,
> Manrope/Inter, семантические токены oklch, светлые и тёмная темы.

## Принципы

1. Все цвета UI — семантические shadcn-токены (`bg-background`, `text-muted-foreground`, `border-border`…) из `src/app/(app)/globals.css`; прямые tailwind-цвета (zinc/amber/…) в модулях не используются. Исключение — emerald для статуса «Прочитана» (semantic success).
2. **Акцент терракотовый (`--primary`)** — рейтинг, активные чипы, empty-state, фавикон. Статусы: «Читаю» — primary, «Прочитана» — emerald, «Хочу прочитать» — нейтральный muted.
3. Пилюли и мягкие радиусы: чипы/бейджи/кнопки пагинации — `rounded-full`, контейнеры — `rounded-2xl`.
4. Движение короткое: hover-подъём карточки, zoom обложки, 300–500 мс.
5. Интерфейс — на русском. Темы: светлая/тёмная/системная (`ThemeToggle` в хедере).

## Палитра и токены

| Роль               | Токены                                                                              | Применение                        |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------- |
| Фон / поверхности  | `bg-background`, `bg-card/40…/60`, `bg-muted`                                         | страницы, карточки, фильтры       |
| Границы            | `border-border(/70…/80)`, hover `border-primary/40`                                   | контейнеры                        |
| Текст              | `text-foreground`, вторичный `text-muted-foreground`                                  | —                                 |
| Акцент             | `bg-primary/10`, `text-primary`, `ring-primary/25`                                    | рейтинг, выбранные чипы, empty    |
| Статус «Хочу»      | `border-border bg-muted/60 text-muted-foreground`                                     | StatusBadge                       |
| Статус «Читаю»     | `border-primary/40 bg-primary/15 text-primary`                                        | StatusBadge                       |
| Статус «Прочитана» | `border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`      | StatusBadge                       |

Значения в `globals.css` (oklch): светлая — белый фон, графит, терракота `oklch(0.58 0.148 45)`;
тёмная — `oklch(0.135 0.014 285)`, светлая терракота `oklch(0.71 0.13 50)`.
Нейтральная база — холодный графит (hue 285), на ней терракота играет контрастнее.
Хроматика вне токенов запрещена. Шрифтовые токены: `--font-inter`, `--font-manrope` (`font-heading`), `--font-geist-mono`.

Радиусы: `--radius: 0.625rem`, производные `--radius-sm…4xl` — использовать шкалу (`rounded-lg`, `rounded-2xl`), не произвольные значения.

## Типографика

- Шрифты (next/font, cyrillic): **Manrope** — заголовки (`--font-heading`, утилита `font-heading`), **Inter** — текст (`--font-sans`), Geist Mono — код/цифры.
- Заголовок страницы: `font-heading text-4xl sm:text-5xl font-extrabold tracking-tight` + градиент `bg-linear-to-r from-foreground via-foreground to-foreground/45` (bg-clip-text).
- Надзаголовки-метки: `text-[11px] font-medium uppercase tracking-wider text-muted-foreground`.
- Название книги (карточка): `font-medium` + `truncate`/`line-clamp-2`; автор: `text-xs/sm text-muted-foreground`.
- Метаданные/чипы: `text-xs` (в списке — `text-[11px]`).

## Сетка

- **Единый контейнер `SiteContainer`** (`@/shared/components/site-container.tsx`): `mx-auto w-full max-w-450 px-4 sm:px-6 lg:px-8` — хедер, список и страница книги; вертикальные отступы задаёт страница (`py-8`).
- Сетка карточек: 1/sm:2/md:3/lg:4/xl:5, `gap-5`; список — `gap-3`; заметки книги: `md:grid-cols-2 2xl:grid-cols-3`.
- Хедер `h-16`, sticky; sticky-панель фильтров прилипает под ним: `top-16`.
- Hover карточки в плитке: `-translate-y-1 border-primary/40 shadow-xl shadow-black/5 dark:shadow-black/40`, обложка `scale-105` (500 мс); в списке — без подъёма: `bg-card/70` + `border-primary/30`.
- Нажатие: `active:scale-95`; фокус: shadcn `focus-visible:ring-3 ring-ring/30`; disabled: `opacity-50`.
- Иконки lucide: `h-4 w-4` базово, `h-3 w-3` в пилюлях, `h-7…10 w-7…10` в empty-state/заглушках.
- Skeleton: `animate-pulse`, пропорции `aspect-[2/3]`.

## UI-kit

shadcn (стиль radix-luma, `@/shared/components/ui/`): Button (`secondary`/`outline`/`ghost`, `asChild` для Link), Badge, Input, Select, Popover, Sheet (`side="bottom"`), ScrollArea, DropdownMenu.
Новые: `pnpm exec shadcn add <name>`.

Каркас (`@/shared/components/`): `SiteHeader` (h-16, лого `public/logo.svg` — «Архив 451», навигация, ThemeToggle, слот меню пользователя — `UserMenu` из модуля auth, пользователь приходит пропсом из приватного layout), `SiteNav` (активная ссылка через usePathname), `SiteContainer` (единая сетка), `ThemeProvider`/`ThemeToggle` (next-themes: system по умолчанию), `PagePlaceholder` (заглушка раздела в стиле empty-state).

**Айдентика** (отсылка к «451 °F по Фаренгейту» — температуре возгорания бумаги):
`public/logo.svg` — саламандра, свёрнутая кольцом, с языком пламени в центре (хранитель архива);
`src/app/icon.svg` — фавикон: пламя с тёмным ядром на тёмной плитке. Огненный градиент:
`#FFD84D → #FB8500 → #E85D04 → #C1121F`.

## Паттерны

- **Карточка книги, «Плитка»:** обложка `aspect-[2/3]` во всю ширину → поверх StatusBadge слева, рейтинг-пилюля (primary) справа → название (`line-clamp-2`), автор, «N заметок» + до 2 чипов тегов.
- **Карточка книги, «Список»** (строка-«таблица»): компактная обложка `w-16 sm:w-20 rounded-lg` → текст (название; «автор · N заметок»; до 4 чипов тегов) → правая мета-зона (`items-end`: StatusBadge + рейтинг) → шеврон `ChevronRight` на hover. Статус и рейтинг не накладываются на маленькую обложку.
- **Sticky-тулбар фильтров:** одна строка `rounded-2xl bg-background/85 backdrop-blur-xl p-3` — поиск (с кнопкой очистки), пилюли статусов (`h-9`, активная — заливка primary), «Теги» (Popover с чипами и счётчиком), рейтинг и сортировка — Select (`h-9`), «Сбросить». На мобильных — Sheet с тем же содержимым.
- **Страница книги:** «Назад», сетка `[280px_minmax(0,1fr)]`, мета: статус + оценка + дата + счётчик + теги, описание (`max-w-2xl`), `sourceUrl` → «Открыть в Яндекс.Книгах» (`target="_blank"`), секция «Заметки».
- **Заметка (NoteCard):** заголовок + дата (ru-RU) + Markdown (`react-markdown` + `remark-gfm`) в `prose prose-sm dark:prose-invert`; ссылки и код — primary.
- **Пустые состояния:** пунктирная граница, иконка в кольце (primary/70), подсказка, кнопка «Сбросить фильтры».
- **Экран входа/регистрации (`/auth`):** центрированная карточка `max-w-md rounded-2xl border-border/70 bg-card/60`, пламя в кольце (`bg-primary/10 ring-primary/25`), заголовок-градиент; переключатель форм — две пилюли `rounded-full` (активная — заливка primary, `aria-pressed`); поля — `Input h-10` с иконкой слева и «глазом» для пароля; ошибки — плашка `border-destructive/30 bg-destructive/10`; кнопка отправки `size="lg"` во всю ширину.
- **Личный кабинет (`/profile`, `/notes`, `/settings`):** двухколоночный каркас route group `(account)`: слева сайдбар-карточка (`rounded-2xl border-border/70 bg-card/60 p-3`, `lg:sticky lg:top-20`; на мобильных — колонкой над контентом), пункты с иконками `h-4 w-4` — активный `bg-accent text-accent-foreground` (`aria-current="page"`), «Выйти» отделён `border-t`; справа — контент колонкой. Вкладки настроек («Почта»/«Пароль») — пилюли `w-fit` с иконками (активная — заливка primary, `aria-pressed`); контент вкладки — карточка-секция `SettingsCard` (иконка в кольце `bg-primary/10 ring-primary/25`, заголовок `font-heading`, описание, контент под `border-t`): у смены почты — строка «Текущая почта» на `bg-muted/60`, у смены пароля — подсказка с `ShieldCheck`; формы ограничены `max-w-sm`. Быстрые действия в карточке профиля — `Button variant="outline" size="sm"` с ссылками на `/settings?tab=…`.
- **Скелетоны + Suspense** в compose; пагинация: Select 12/24/48 + круглые номера страниц с «…».

## Доступность

`aria-label` на иконках-кнопках (по-русски), `aria-current="page"` на активной ссылке навигации, интерактивные чипы — `<button aria-pressed>`, клавиатурная навигация Radix, декоративные слои `aria-hidden`.
