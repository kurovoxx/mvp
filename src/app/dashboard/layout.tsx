import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { HardHat, LayoutDashboard, Settings, User } from 'lucide-react';
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

  const navigation = [
    { name: 'Dashboard', href: `/dashboard/${user.rol.replace('jefe_turno', 'jefe').replace('pañolero', 'panolero')}`, icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-slate-900 border-r border-slate-800">
          <div className="flex items-center flex-shrink-0 px-4 mb-5 space-x-2 text-white">
            <HardHat className="text-blue-400" />
            <span className="text-xl font-bold tracking-tight">FaenaControl</span>
          </div>
          <div className="flex flex-col flex-grow px-2 mt-5">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white group"
                >
                  <item.icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-300" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col p-4 space-y-3 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white font-bold text-xs">
                  {user.name?.[0]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user.rol.replace('_', ' ')}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 md:hidden">
          <div className="flex items-center space-x-2">
            <HardHat className="text-blue-600" />
            <span className="text-lg font-bold">FaenaControl</span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
