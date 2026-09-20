# ТЗ: восстановление пароля и профиль в ЛК

> Пошаговый план самостоятельной внедрения двух фич. Стиль кода и слои — `docs/tech-specs.md`,
> дизайн — `docs/design.md`, правила работы и чеклист проверок — `AGENTS.md`.
> Все факты про Payload проверены по установленной версии 3.89 (`node_modules/payload/dist/auth/operations/*`).

## 0. Что уже есть (переиспользуем)

| Кусок | Где | Что даёт |
| --- | --- | --- |
| `AuthRepository` (login/register/me/getSessionCookie) | `src/modules/auth/repository/` | шаблон для новых методов |
| `AuthFormState` (error + fieldErrors) | `src/modules/auth/domain/auth.ts` | контракт форм ↔ экшенов |
| `FormField` / `FormError` | `src/modules/auth/ui/` | готовые поля с иконками и ошибками |
| Карточка входа (пламя + заголовок) | `src/modules/auth/compose/auth-view.tsx` | разметку вынесем в `AuthCard` |
| Гард `/auth` (авторизованного → `/`) | `src/app/(app)/auth/page.tsx` | перенесём в layout |
| `PagePlaceholder` | `src/shared/components/` | для `/notes`, `/settings` остаётся |

Общие правила: `getAppPayload` — только в repository; zod-валидация в экшенах; строки интерфейса —
русские; цвета — только токены; после правок коллекций — `pnpm exec tsc --noEmit` + проверки из AGENTS.md.

---

## Фича А. Восстановление пароля

### Поток

1. `/auth` → ссылка «Забыли пароль?» → `/auth/forgot-password` → форма с email.
2. Экшен → `payload.forgotPassword` → Payload пишет письмо со ссылкой
   `/auth/reset-password?token=…` (токен одноразовый, живёт 1 час — `auth.forgotPassword.expiration`, мс).
3. Пользователь открывает ссылку → форма нового пароля (+ повтор) → `payload.resetPassword`.
4. Успех → авто-вход (как при регистрации) → `redirect('/')`.

Миграция БД **не нужна**: колонки `resetPassword_token` / `resetPassword_expiration` в таблице users
уже существуют (см. `payload-types.ts`).

### Шаг A.1 — email-адаптер без новых зависимостей

Без адаптера Payload только пишет warning, а письмо не уходит. В `src/modules/admin/payload.config.ts`
добавить консольный адаптер (в dev ссылка будет в терминале):

```ts
import type { EmailAdapter } from 'payload';

// Dev-адаптер: письмо целиком уходит в лог сервера (там будет ссылка сброса)
const consoleEmailAdapter: EmailAdapter = ({ payload }) => ({
    sendEmail: async (message) => {
        payload.logger.info({ subject: message.subject, html: message.html }, '📧 Письмо (dev)');
    },
});

// в nextConfig-объекте Payload:
// email: consoleEmailAdapter,
```

Продакшен-SMTP — отдельная задача через `@payloadcms/email-nodemailer` (новая зависимость —
по правилам проекта сначала обсудить). Базу ссылки взять из `.env`: `NEXT_PUBLIC_APP_URL`
(добавить в `.env.example`, значение по умолчанию `http://localhost:3000`).

### Шаг A.2 — коллекция users: шаблон письма

В `user.ts` внутрь `auth: true` превратить в объект и добавить генераторы письма:

```ts
auth: {
    useAsTitle: ... // не трогаем
    forgotPassword: {
        generateEmailSubject: () => 'Архив 451 — сброс пароля',
        generateEmailHTML: ({ token }) => {
            const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`;
            return `<p>Здравствуйте! Чтобы сбросить пароль, перейдите по ссылке:</p><a href="${url}">${url}</a><p>Ссылка действует 1 час.</p>`;
        },
    },
},
```

Полей не добавляем → `payload generate:types` и дроп/пуш БД не требуются (dev-сервер можно не гасить).

### Шаг A.3 — repository (`auth-repository.ts`)

```ts
// Запрос сброса; результат всегда «успех» — не раскрываем существование почты (анти-энумерация)
async requestPasswordReset(email: string): Promise<void> {
    const payload = await getAppPayload();
    await payload.forgotPassword({ collection: 'users', data: { email } });
},

// Сброс по токену; null — токен невалиден/просрочен, иначе — сессия авто-входа
async resetPassword({ token, password }: { token: string; password: string }): Promise<AuthSession | null> {
    const payload = await getAppPayload();

    let email: string;
    try {
        const result = await payload.resetPassword({
            collection: 'users',
            data: { password, token },
            overrideAccess: true, // у resetPassword этот флаг обязателен по типам
        });
        email = result.user.email;
    } catch {
        // Payload кидает APIError 403 «Token is either invalid or has expired.»
        return null;
    }

    return AuthRepository.login({ email, password });
},
```

Факты: `forgotPassword` возвращает строку-статус (токен уходит только в письмо);
`resetPassword` требует `overrideAccess: boolean`, при успехе возвращает `{ user }`,
снимает блокировку `maxLoginAttempts` и (в JWT-стратегии с сессиями) инвалидирует старые сессии.

### Шаг A.4 — domain и actions

1. `domain/auth.ts`: расширить `AuthFormState` полем `success?: string` (для экрана «письмо отправлено»).
2. `actions/auth.ts` — два экшена по образцу `login`:

```ts
const emailSchema = z.object({ email: z.string().email('Введите корректную почту') });

// Всегда успешен для вызывающего: и для существующей, и для неизвестной почты ответ одинаков
export async function forgotPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const validatedFields = emailSchema.safeParse({ email: formData.get('email') });
    if (!validatedFields.success) {
        return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }
    await AuthRepository.requestPasswordReset(validatedFields.data.email);
    return { success: 'Если почта зарегистрирована, письмо со ссылкой уже отправлено.' };
}

export async function resetPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const token = String(formData.get('token') ?? '');
    // … zod на password (min 8) + сверка passwordConfirm, как в register …
    const session = await AuthRepository.resetPassword({ token, password });
    if (!session) {
        return { error: 'Ссылка недействительна или устарела. Запросите сброс ещё раз.' };
    }
    await setSessionCookie(session.token);
    redirect('/');
}
```

### Шаг A.5 — ui

1. **Вынести карточку**: `src/modules/auth/ui/auth-card.tsx` — пламя в кольце, заголовок-градиент,
   подзаголовок и `<div>`-слот для контента (параметры: `title`, `subtitle`, `children`).
   Перевести `compose/auth-view.tsx` на неё (разметка не меняется — только перенос).
2. **`ui/forgot-password-form.tsx`**: `FormField` (email, иконка `Mail`) + кнопка «Отправить ссылку».
   Когда пришёл `state.success` — показать плашку вместо формы (стиль `FormError`, но
   `border-primary/30 bg-primary/10 text-primary`) и ссылку «Назад ко входу».
3. **`ui/reset-password-form.tsx`**: `<input type="hidden" name="token">` (значение из страницы),
   два `FormField` (пароль `Lock`/`new-password`, повтор `KeyRound`) + кнопка «Сменить пароль».
4. **`login-form.tsx`**: под кнопкой добавить `Link href="/auth/forgot-password"` — «Забыли пароль?»
   (стиль маленькой ссылки: `text-xs text-muted-foreground hover:text-foreground`).

### Шаг A.6 — маршруты и гард

1. Гард вынести из `page.tsx` в **`src/app/(app)/auth/layout.tsx`** (async, `AuthRepository.me()` →
   `redirect('/')`), из `page.tsx` удалить — layout накроет сразу все auth-страницы.
2. `src/app/(app)/auth/forgot-password/page.tsx` — metadata «Восстановление пароля»,
   рендер: `AuthCard` + форма (страница статическая, compose с данными не нужен).
3. `src/app/(app)/auth/reset-password/page.tsx` — **searchParams — Promise (Next 16):**

```tsx
type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;
    // нет токена → <AuthCard> с текстом «Ссылка недействительна» + ссылка на forgot-password
}
```

### Шаг A.7 — приёмка

- Smoke через `pnpm exec payload run` (по образцу прошлых скриптов, потом удалить):
  `forgotPassword` существующей почты → письмо с токеном в логе; несуществующей → письмо нет,
  ошибок тоже нет; `resetPassword` по токену → вход со старым паролем даёт `null`, с новым — сессию;
  повторный use того же токена → `null`.
- Гость: `/auth/forgot-password` → 200; авторизованный → 307 `/` (гард layout).
- `tsc --noEmit`, dev-лог без новых ошибок.

---

## Фича Б. Профиль в ЛК (`/profile`)

### Б.1 Данные

В `domain/auth.ts` расширить `AuthUser` полем `createdAt: string` (есть в сгенерированном `User`),
в `AuthRepository.me()` добавить маппинг. Счётчик заметок и другую кросс-модульную статистику
сюда не тащить — это отдельные фичи из дорожной карты.

### Б.2 Страница

Layout пользователя уже знает, но page пропсов из layout не видит — `me()` вызывается в compose
ещё раз (это дешёвый `payload.auth` по заголовкам):

```
(private)/profile/page.tsx        — metadata «Профиль», рендерит compose/profile-view.tsx
compose/profile-view.tsx          — async, AuthRepository.me(); null → redirect('/auth') (страховка)
ui/profile-card.tsx               — 'use client' не нужен: карточка статическая
```

Карточка (`max-w-md` по центру, как карточка входа):

- аватар-инициал: первая буква email в кольце (`bg-primary/10 ring-primary/25 text-primary`, `uppercase`);
- email (`truncate`, `font-medium`);
- роль пилюлей в стиле StatusBadge: `admin` → `border-primary/40 bg-primary/15 text-primary`,
  `user` → `border-border bg-muted/60 text-muted-foreground` (лейбл из `AUTH_ROLE_LABELS`);
- строка «В архиве с <дата>» — `new Date(createdAt).toLocaleDateString('ru-RU')`;
- ссылки-действия не нужны: «Сменить пароль» появится в «Настройках» (см. бонус).

`/notes` и `/settings` остаются на `PagePlaceholder` — не трогать.

### Б.3 Приёмка

- Гость → `/profile` → 307 `/auth`; авторизованный видит свой email, роль, дату.
- Выход через меню хедера по-прежнему работает (карточка ничего не кэширует — серверный рендер).

---

## Чеклист перед завершением каждой фичи

1. `pnpm exec tsc --noEmit` — чисто (записи `.next/types` игнорируем).
2. Страницы отвечают как ожидается (curl: 200/307 по таблице гардов).
3. `.next/dev/logs/next-development.log` — нет новых ошибок.
4. `grep -rn "zinc-\|amber-\|indigo-" src/modules src/shared` — пусто.
5. Документация: `business-logic.md` (строки таблицы `/auth/*`, `/profile`),
   `tech-specs.md` (новые методы repository/actions/ui), `design.md` (если появился новый паттерн).
6. Временные smoke-скрипты из `scripts/` удалить.

## Бонус (необязательно, после основного)

Смена пароля в `/settings`: форма «текущий пароль + новый + повтор»; экшен проверяет текущий
через `AuthRepository.login` (ошибка → fieldErrors текущего пароля), затем `payload.updateByID`
на своём `id` с новым `password` (Local API, `overrideAccess` — доступ не нужен), снова
`setSessionCookie` — сессия обновится. Токен не участвует, письмо не требуется.
