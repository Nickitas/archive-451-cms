import { redirect } from 'next/navigation';
import { AuthRepository } from '../repository/auth-repository';
import { ProfileCard } from '../ui/profile-card';

// Данные профиля; редирект — страховка, доступ уже закрывает (private)/layout
export async function ProfileView() {
    const user = await AuthRepository.me();

    if (!user) {
        redirect('/auth');
    }

    return <ProfileCard user={user} />;
}
