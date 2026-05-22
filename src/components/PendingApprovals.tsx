import { db } from '@/lib/db';
import { assets, loans } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { AlertTriangle, Check, XCircle } from 'lucide-react';

export default async function PendingApprovals() {
  const session = await getServerSession(authOptions);
  
  const filteredLoans = await db.query.loans.findMany({
    where: and(
      eq(loans.inspeccionSalidaPañolero, false),
      eq(loans.inspeccionSalidaMecanico, true), // MUST be confirmed by mechanic first
      isNull(loans.fechaHoraSalida),
      eq(loans.cierreValidado, false)
    ),
    with: {
      activo: true,
      mecanico: true,
    }
  });

  async function approveLoan(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    const session = await getServerSession(authOptions);
    if (!session) return;

    const loan = await db.query.loans.findFirst({
      where: eq(loans.id, loanId),
    });

    if (!loan) return;

    // Update loan with pañolero approval and timestamp
    await db.update(loans)
      .set({ 
        pañoleroSalidaId: (session.user as any).id,
        inspeccionSalidaPañolero: true,
        fechaHoraSalida: new Date(),
        resultadoInspeccionSalida: 'aprobada'
      })
      .where(eq(loans.id, loanId));

    // Update asset status to 'en_uso'
    await db.update(assets)
      .set({ estado: 'en_uso' })
      .where(eq(assets.id, loan.activoId));

    revalidatePath('/dashboard/panolero');
  }

  async function blockForEvaluation(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    const assetId = formData.get('assetId') as string;
    const session = await getServerSession(authOptions);
    if (!session) return;

    // 1. Mark loan as closed (it failed the safety gate)
    await db.update(loans)
      .set({ 
        cierreValidado: true,
        pañoleroSalidaId: (session.user as any).id,
        resultadoInspeccionSalida: 'rechazada'
      })
      .where(eq(loans.id, loanId));

    // 2. Block the asset for the Inspector
    await db.update(assets)
      .set({ estado: 'bloqueada' })
      .where(eq(assets.id, assetId));

    revalidatePath('/dashboard/panolero');
  }

  async function cancelRequest(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    const assetId = formData.get('assetId') as string;

    // 1. Just close the loan without blocking the asset
    await db.update(loans)
      .set({ cierreValidado: true })
      .where(eq(loans.id, loanId));

    // 2. Asset returns to available
    await db.update(assets)
      .set({ estado: 'disponible' })
      .where(eq(assets.id, assetId));

    revalidatePath('/dashboard/panolero');
  }

  return (
    <div className="space-y-4">
      {filteredLoans.length === 0 ? (
        <p className="text-sm text-slate-500 italic text-center py-4">No hay solicitudes pendientes de despacho.</p>
      ) : (
        filteredLoans.map((loan: any) => {
          const isRejectedByMechanic = loan.resultadoInspeccionSalida === 'rechazada';
          
          return (
            <div 
              key={loan.id} 
              className={`p-4 rounded-xl border-2 transition-all ${
                isRejectedByMechanic 
                  ? 'bg-red-50 border-red-200 shadow-sm' 
                  : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{loan.activo.nombre}</p>
                    {isRejectedByMechanic && (
                      <span className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase animate-pulse">
                        <AlertTriangle size={10} /> Falla Reportada
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <span className="font-semibold">Mecánico:</span> {loan.mecanico.nombre}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <span className="font-semibold">OT:</span> {loan.ordenTrabajoId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!isRejectedByMechanic ? (
                  <form action={approveLoan} className="flex-1">
                    <input type="hidden" name="loanId" value={loan.id} />
                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      <Check size={14} /> Confirmar Despacho
                    </button>
                  </form>
                ) : (
                  <>
                    <form action={blockForEvaluation} className="flex-1 min-w-[140px]">
                      <input type="hidden" name="loanId" value={loan.id} />
                      <input type="hidden" name="assetId" value={loan.activoId} />
                      <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                      >
                        <AlertTriangle size={14} /> Enviar a Inspector
                      </button>
                    </form>
                    <form action={cancelRequest} className="flex-1 min-w-[140px]">
                      <input type="hidden" name="loanId" value={loan.id} />
                      <input type="hidden" name="assetId" value={loan.activoId} />
                      <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 bg-white text-slate-600 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        <XCircle size={14} /> Cancelar Préstamo
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
