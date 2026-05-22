import { db } from '@/lib/db';
import { assets, loans, users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import ReturnToolForm from '@/components/ReturnToolForm';
import MechanicConfirmation from '@/components/MechanicConfirmation';

export default async function MecanicoDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;

  // Get available and calibrated assets
  const availableAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.estado, 'disponible'),
      gt(assets.fechaVencimientoCalibracion, new Date())
    )
  });

  // Get active loans for this mechanic
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Mecánico</h1>
        <p className="mt-1 text-sm text-slate-600">Solicite herramientas y gestione sus préstamos activos.</p>
      </div>

      {/* Request Tool Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
          Solicitar Nueva Herramienta
        </h2>
        <form action={requestLoan} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700">Herramienta Disponible</label>
            <select 
              name="assetId" 
              required
              className="mt-1 block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border ring-1 ring-slate-200"
            >
              <option value="">Seleccione una herramienta...</option>
              {availableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.nombre} ({asset.ubicacionFisica})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Orden de Trabajo (OT)</label>
            <input 
              type="text" 
              name="otId" 
              required
              placeholder="Ej: OT-2024-001"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 ring-1 ring-slate-200"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Enviar Solicitud
          </button>
        </form>
      </section>

      <MechanicConfirmation />

      <ReturnToolForm />

      {/* Active Loans Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Mis Préstamos y Solicitudes</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {activeLoans.length === 0 ? (
            <p className="p-6 text-center text-slate-500 italic">No tienes préstamos o solicitudes activas.</p>
          ) : (
            activeLoans.map((loan: any) => (
              <div key={loan.id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{loan.activo.nombre}</h3>
                  <p className="text-sm text-slate-500">OT: {loan.ordenTrabajoId}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    loan.activo.estado === 'en_devolucion'
                      ? 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse'
                      : loan.fechaHoraSalida 
                        ? 'text-blue-700 bg-blue-50 border-blue-200' 
                        : 'text-slate-700 bg-slate-50 border-slate-200'
                  }`}>
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
      </section>
    </div>
  );
}
