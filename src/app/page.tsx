import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const rol = (session.user as any).rol;

  switch (rol) {
    case 'jefe_turno':
      redirect('/dashboard/jefe');
    case 'pañolero':
      redirect('/dashboard/panolero');
    case 'mecanico':
      redirect('/dashboard/mecanico');
    case 'inspector':
      redirect('/dashboard/inspector');
    default:
      redirect('/login');
  }
}
