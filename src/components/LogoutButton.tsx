'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 border border-red-400/20 rounded-md hover:bg-red-400/10 transition-colors"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar Sesión
    </button>
  );
}
