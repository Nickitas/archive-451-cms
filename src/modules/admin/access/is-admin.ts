import type { Access } from 'payload';
import type { User } from '../payload-types';

export const isAdmin: Access<User> = ({ req: { user }, id }) => {
    // Админам — любые операции
    if (user?.role === 'admin') {
        return true;
    }

    // Остальным — операции только с самим собой. Важно: на create у документа ещё нет id,
    // и без проверки user ветка вырождалась бы в `undefined === undefined` — доступ всем анонимам
    return Boolean(user && id !== undefined && user.id === id);
};
