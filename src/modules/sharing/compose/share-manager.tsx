import { redirect } from 'next/navigation';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { BooksRepository } from '@/modules/books/repository/books-repository';
import { SharingRepository } from '../repository/sharing-repository';
import { ShareManagerView } from '../ui/share-manager-view';

export async function ShareManager() {
    const user = await AuthRepository.me();
    if (!user) redirect('/auth');

    const [books, state] = await Promise.all([
        BooksRepository.getShareCandidates(user.id),
        SharingRepository.getManagerState(user.id),
    ]);

    return <ShareManagerView books={books} selectedBookIds={state.selectedBookIds} isActive={state.active} />;
}
