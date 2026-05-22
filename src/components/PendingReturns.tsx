import { db } from '@/lib/db';
import { assets, loans } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export default async function PendingReturns() {
  const session = await getServerSession(authOptions);
  
  const allActiveLoans = await db.query.loans.findMany({
    where: isNull(loans.fechaHoraDevolucion),
    with: {
      activo: true,
      mecanico: true,
    }
  });

  // Filter those where the associated asset is in 'en_devolucion' state
  const returningLoans = allActiveLoans.filter(loan => loan.activo.estado === 'en_devolucion');

  async function validateReturn(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    const condition = formData.get('condition') as 'aprobada' | 'con_daño';
    const session = await getServerSession(authOptions);
    if (!session) return;

    const loan = await db.query.loans.findFirst({
      where: eq(loans.id, loanId),
    });

    if (!loan) return;

    const needsEvaluation = condition === 'con_daño' || loan.falloReportadoUso;

    // Update loan record
    await db.update(loans)
      .set({ 
        pañoleroDevolucionId: (session.user as any).id,
        fechaHoraDevolucion: new Date(),
        inspeccionDevolucionPañolero: true,
        resultadoInspeccionDevolucion: condition,
        cierreValidado: !needsEvaluation
      })
      .where(eq(loans.id, loanId));

    // Update asset status
    await db.update(assets)
      .set({ 
        estado: needsEvaluation ? 'en_evaluacion' : 'disponible' 
      })
      .where(eq(assets.id, loan.activoId));

    revalidatePath('/dashboard/panolero');
  }

  return (
    <div className="space-y-4">
      {returningLoans.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No hay herramientas en proceso de devolución.</p>
      ) : (
        returningLoans.map((loan: any) => (
          <div key={loan.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-slate-900">{loan.activo.nombre}</p>
                <p className="text-xs text-slate-500">Devuelto por: {loan.mecanico.nombre}</p>
                {loan.falloReportadoUso && (
                  <div className="mt-1 p-2 bg-red-50 text-red-700 text-[10px] rounded border border-red-100">
                    <span className="font-bold">FALLO REPORTADO:</span> {loan.descripcionFallo}
                  </div>
                )}
              </div>
            </div>
            <form action={validateReturn} className="flex gap-2">
              <input type="hidden" name="loanId" value={loan.id} />
              <button 
                name="condition"
                value="aprobada"
                className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700"
              >
                Aceptar Sin Daños
              </button>
              <button 
                name="condition"
                value="con_daño"
                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
              >
                Reportar Daño
              </button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
