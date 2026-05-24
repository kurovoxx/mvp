import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { HardHat, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = session.user as any;
  const userRolePath = user.rol.replace('jefe_turno', 'jefe').replace('pañolero', 'panolero');

  const navigation = [
    { name: 'Dashboard', href: `/dashboard/${userRolePath}`, icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-primary border-r border-primary shadow-xl z-10">
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8 gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <HardHat className="text-accent w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold tracking-tight text-surface">
              FaenaControl
            </span>
          </div>
          
          <div className="flex flex-col flex-grow px-4">
            <nav className="flex-1 space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary rounded-lg transition-all duration-200 hover:bg-surface/10 hover:text-surface group"
                >
                  <item.icon className="w-5 h-5 mr-3 text-secondary group-hover:text-surface transition-colors" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-surface/10 bg-primary">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="flex items-center justify-center w-9 h-9 bg-accent rounded-full text-surface font-semibold text-sm shadow-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface truncate">
                  {user.name}
                </p>
                <p className="text-xs text-secondary truncate capitalize">
                  {user.rol.replace('_', ' ')}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-light shadow-sm md:hidden z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/10 rounded-md">
              <HardHat className="text-accent w-5 h-5" />
            </div>
            <span className="text-base font-semibold text-primary">FaenaControl</span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none w-full">
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}