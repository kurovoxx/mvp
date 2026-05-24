import { db } from '@/lib/db';
import { assets, loans } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import ReturnToolForm from '@/components/ReturnToolForm';
import MechanicConfirmation from '@/components/MechanicConfirmation';
import { Plus, Wrench, Activity } from 'lucide-react';

export default async function MecanicoDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;

  const availableAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.estado, 'disponible'),
      gt(assets.fechaVencimientoCalibracion, new Date())
    )
  });

  const activeLoans = await db.query.loans.findMany({
    where: and(
      eq(loans.mecanicoId, userId),
      eq(loans.cierreValidado, false)
    ),
    with: {
      activo: true
    }
  });

  async function requestLoan(formData: FormData) {
    'use server';
    const assetId = formData.get('assetId') as string;
    const otId = formData.get('otId') as string;
    const session = await getServerSession(authOptions);
    
    if (!session) return;

    await db.insert(loans).values({
      id: uuidv4(),
      activoId: assetId,
      mecanicoId: (session.user as any).id,
      ordenTrabajoId: otId,
      fechaHoraSalida: null,
    });

    await db.update(assets)
      .set({ estado: 'solicitada' })
      .where(eq(assets.id, assetId));

    revalidatePath('/dashboard/mecanico');
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Panel de Mecánico</h1>
        <p className="mt-1.5 text-sm text-secondary">Solicite herramientas y gestione sus préstamos activos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex items-center gap-2.5 bg-background/50">
              <Plus className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-semibold text-primary">
                Solicitar Herramienta
              </h2>
            </div>
            
            <div className="p-6">
              <form action={requestLoan} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="assetId" className="block text-sm font-medium text-primary mb-1.5">
                    Herramienta Disponible
                  </label>
                  <select 
                    id="assetId"
                    name="assetId" 
                    required
                    className="block w-full rounded-lg border border-border-light bg-background px-3 py-2.5 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition-all appearance-none"
                  >
                    <option value="" className="text-secondary">Seleccione una herramienta...</option>
                    {availableAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.nombre} ({asset.ubicacionFisica})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="otId" className="block text-sm font-medium text-primary mb-1.5">
                    Orden de Trabajo (OT)
                  </label>
                  <input 
                    id="otId"
                    type="text" 
                    name="otId" 
                    required
                    placeholder="Ej: OT-2024-001"
                    className="block w-full rounded-lg border border-border-light bg-background px-3 py-2.5 text-primary placeholder:text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transition-all"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="mt-2 w-full flex justify-center items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-surface shadow-sm transition-all duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>
          </section>

          <MechanicConfirmation />
          <ReturnToolForm />
        </div>

        <div className="lg:col-span-2">
          <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border-light flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-secondary" />
                <h2 className="text-sm font-semibold text-primary">Mis Préstamos y Solicitudes</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="text-xs font-medium text-secondary">{activeLoans.length} activos</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-border-light">
                {activeLoans.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <Wrench className="w-10 h-10 text-secondary/30 mb-3" />
                    <p className="text-sm text-secondary">No tienes préstamos o solicitudes activas.</p>
                  </div>
                ) : (
                  activeLoans.map((loan: any) => (
                    <div key={loan.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/50 transition-colors">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-primary">{loan.activo.nombre}</h3>
                        <p className="text-xs text-secondary mt-1 font-mono bg-background inline-block px-2 py-0.5 rounded border border-border-light w-fit">
                          OT: {loan.ordenTrabajoId}
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          loan.activo.estado === 'en_devolucion'
                            ? 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse'
                            : loan.fechaHoraSalida 
                              ? 'text-accent bg-accent/10 border-accent/20' 
                              : 'text-secondary bg-background border-border-light'
                        }`}>
                          {loan.activo.estado === 'en_devolucion' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                          )}
                          {!loan.activo.estado && loan.fechaHoraSalida && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5"></span>
                          )}
                          {loan.activo.estado === 'en_devolucion' 
                            ? 'En Devolución' 
                            : loan.fechaHoraSalida 
                              ? 'En Uso' 
                              : 'Pendiente Aprobación'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}