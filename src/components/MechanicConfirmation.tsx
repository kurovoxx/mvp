import { db } from '@/lib/db';
import { assets, loans } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { revalidatePath } from 'next/cache';
import { Eye, CheckCircle2 } from 'lucide-react';

export default async function MechanicConfirmation() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const userId = (session.user as any).id;

  // Find loans where asset is 'solicitada' and mechanic hasn't confirmed inspection yet
  const pendingConfirmations = await db.query.loans.findMany({
    where: and(
      eq(loans.mecanicoId, userId),
      eq(loans.inspeccionSalidaMecanico, false)
    ),
    with: {
      activo: true
    }
  });

  async function confirmInspection(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    
    await db.update(loans)
      .set({ 
        inspeccionSalidaMecanico: true,
        resultadoInspeccionSalida: 'aprobada'
      })
      .where(eq(loans.id, loanId));

    revalidatePath('/dashboard/mecanico');
  }

  async function reportDamage(formData: FormData) {
    'use server';
    const loanId = formData.get('loanId') as string;
    
    // Flag as 'rechazada' and mark mechanic inspection as done
    // This sends it to the pañolero's queue with a warning
    await db.update(loans)
      .set({ 
        inspeccionSalidaMecanico: true,
        resultadoInspeccionSalida: 'rechazada'
      })
      .where(eq(loans.id, loanId));

    revalidatePath('/dashboard/mecanico');
  }

  if (pendingConfirmations.length === 0) return null;

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-8">
      <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-4">
        <Eye size={20} />
        Confirmación e Inspección Visual
      </h2>
      <p className="text-sm text-blue-800 mb-6">
        El pañolero tiene la herramienta lista. Por favor, <strong>verifica su estado físicamente</strong> antes de confirmar la recepción.
      </p>
      
      <div className="space-y-4">
        {pendingConfirmations.map((loan: any) => (
          <div key={loan.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900">{loan.activo.nombre}</p>
                <p className="text-xs text-slate-500 font-mono">ID: {loan.activo.id.slice(0, 8)}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                Esperando tu V°B°
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <form action={confirmInspection} className="flex-1">
                <input type="hidden" name="loanId" value={loan.id} />
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  Confirmar Buen Estado
                </button>
              </form>
              
              <form action={reportDamage} className="flex-1">
                <input type="hidden" name="loanId" value={loan.id} />
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-all active:scale-95"
                >
                  Reportar Daño / Falla
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
