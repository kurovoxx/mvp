import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const roleRoutes: Record<string, string> = {
    'jefe_turno': '/dashboard/jefe',
    'pañolero': '/dashboard/panolero',
    'mecanico': '/dashboard/mecanico',
    'inspector': '/dashboard/inspector',
  };

  const userRole = (session.user as any).rol;
  const destination = roleRoutes[userRole] || '/login';

  redirect(destination);
}