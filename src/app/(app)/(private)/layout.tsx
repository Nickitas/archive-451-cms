import { redirect } from 'next/navigation';
import { AuthRepository } from '@/modules/auth/repository/auth-repository';
import { SiteHeader } from '@/shared/components/site-header';

export default async function PrivateLayout({ children }: LayoutProps<"/">) {
  const user = await AuthRepository.me();

  if (!user) {
    redirect('/auth');
  }

  return (
    <>
      <SiteHeader user={user} />
      {children}
    </>
  );
}
