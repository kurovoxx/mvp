import { db } from '@/lib/db';
import { assets, loans } from '@/lib/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { revalidatePath } from 'next/cache';
import { HardHat, AlertTriangle, CheckCircle } from 'lucide-react';

export default async function ReturnToolForm() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const userId = (session.user as any).id;

  // Get loans currently active (not returned)
  const allActiveLoans = await db.query.loans.findMany({
    where: and(
      eq(loans.mecanicoId, userId),
      sql`${loans.fechaHoraSalida} IS NOT NULL`,
      isNull(loans.fechaHoraDevolucion)
    ),
    with: {
      activo: true
    }
  });

  // Filter ONLY those where the asset is still 'en_uso'
  const activeLoans = allActiveLoans.filter(loan => loan.activo.estado === 'en_uso');

  async function handleReturn(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    const falloReportado = formData.get('falloReportado') === 'true';
    const descripcionFallo = formData.get('descripcionFallo') as string;

    const loan = await db.query.loans.findFirst({
      where: eq(loans.id, loanId),
    });

    if (!loan) return;

    // Update loan to 'en_devolucion'
    await db.update(loans)
      .set({
        falloReportadoUso: falloReportado,
        descripcionFallo: falloReportado ? descripcionFallo : null,
        // We don't set fechaHoraDevolucion yet, that's for the Pañolero to confirm
      })
      .where(eq(loans.id, loanId));

    // Update asset state
    await db.update(assets)
      .set({ estado: 'en_devolucion' })
      .where(eq(assets.id, loan.activoId));

    revalidatePath('/dashboard/mecanico');
  }

  if (activeLoans.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
        <CheckCircle className="text-green-600" size={20} />
        Devolución de Herramientas
      </h2>
      <div className="space-y-6">
        {activeLoans.map((loan: any) => (
          <form key={loan.id} action={handleReturn} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{loan.activo.nombre}</p>
                <p className="text-sm text-slate-500">OT: {loan.ordenTrabajoId}</p>
              </div>
              <div className="space-y-3 flex-1 max-w-xs">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="falloReportado" 
                    value="true" 
                    id={`fallo-${loan.id}`}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`fallo-${loan.id}`} className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Reportar fallo/daño
                  </label>
                </div>
                <textarea 
                  name="descripcionFallo" 
                  placeholder="Describa el fallo si aplica..."
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                  rows={2}
                />
                <input type="hidden" name="loanId" value={loan.id} />
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800 transition-colors"
                >
                  Confirmar Entrega en Pañol
                </button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
