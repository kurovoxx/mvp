'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HardHat, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Credenciales inválidas o cuenta desactivada');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-2xl shadow-sm border border-border-light">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl mb-5">
            <HardHat className="text-accent w-7 h-7" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            Control de Activos Críticos
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Inicie sesión con su cuenta corporativa
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-border-light bg-background px-3 py-2.5 text-primary placeholder:text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition-all duration-200"
                placeholder="ej: usuario@faena.cl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-border-light bg-background px-3 py-2.5 text-primary placeholder:text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-surface shadow-sm transition-all duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-center text-xs text-secondary">
            MVP Sistema de Gestión - Faena Minera
          </p>
        </div>
      </div>
    </div>
  );
}