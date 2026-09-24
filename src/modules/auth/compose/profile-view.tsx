import { redirect } from 'next/navigation';
import { getLocale } from '@/shared/i18n/get-locale';
import { BooksRepository } from '@/modules/books/repository/books-repository';
import { AuthRepository } from '../repository/auth-repository';
import { ProfileCard } from '../ui/profile-card';

// Данные профиля; редирект — страховка, доступ уже закрывает (private)/layout
export async function ProfileView() {
    const locale = await getLocale();
    const user = await AuthRepository.me();

    if (!user) {
        redirect('/auth');
    }

    // Статистика библиотеки из модуля книг: подсчёт заметок живёт там
    const stats = await BooksRepository.getLibraryStats(user.id);

    return <ProfileCard user={user} stats={stats} locale={locale} />;
}
