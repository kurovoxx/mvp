import { db } from '@/lib/db';
import { assets, stateHistory } from '@/lib/db/schema';
import { eq, lt, and, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { AlertCircle, Send, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { v4 as uuidv4 } from 'uuid';

export default async function ExpiredCalibrationList() {
  const today = new Date();
  
  const expiredAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.estado, 'disponible'),
      isNotNull(assets.fechaVencimientoCalibracion),
      lt(assets.fechaVencimientoCalibracion, today)
    ),
  });

  async function sendToInspector(formData: FormData) {
    'use server';
    const assetId = formData.get('assetId') as string;
    const session = await getServerSession(authOptions);
    if (!session) return;

    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId),
    });

    if (!asset) return;

    // 1. Update asset state to 'en_evaluacion'
    await db.update(assets)
      .set({ estado: 'en_evaluacion' })
      .where(eq(assets.id, assetId));

    // 2. Record in state history
    await db.insert(stateHistory).values({
      id: uuidv4(),
      activoId: assetId,
      estadoAnterior: asset.estado,
      estadoNuevo: 'en_evaluacion',
      usuarioResponsableId: (session.user as any).id,
      motivo: 'Bloqueo preventivo: Calibración vencida.',
    });

    revalidatePath('/dashboard/panolero');
    revalidatePath('/dashboard/inspector');
  }

  if (expiredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-500">No hay activos vencidos</p>
        <p className="text-xs text-slate-400 mt-1">Todas las herramientas disponibles tienen calibración vigente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expiredAssets.map((asset) => (
        <div 
          key={asset.id} 
          className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{asset.nombre}</h3>
              <p className="text-xs text-red-700 font-medium mt-0.5">
                Venció el {format(new Date(asset.fechaVencimientoCalibracion!), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 uppercase font-bold">
                  {asset.ubicacionFisica}
                </span>
              </div>
            </div>
          </div>

          <form action={sendToInspector}>
            <input type="hidden" name="assetId" value={asset.id} />
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Send size={14} />
              Enviar a Inspector
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
