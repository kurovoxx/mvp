import InventoryList from '@/components/InventoryList';
import PendingApprovals from '@/components/PendingApprovals';
import PendingReturns from '@/components/PendingReturns';
import ExpiredCalibrationList from '@/components/ExpiredCalibrationList';
import { PackageSearch, ClipboardCheck, ArrowLeftRight } from 'lucide-react';
import { db } from '@/lib/db';
import { assets, stateHistory } from '@/lib/db/schema';
import { eq, lt, and, isNotNull, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { v4 as uuidv4 } from 'uuid';

export default async function PanoleroDashboard() {
  const today = new Date();
  
  // Fetch expired assets on the server
  const expiredAssets = await db.query.assets.findMany({
    where: and(
      or(eq(assets.estado, 'disponible'), eq(assets.estado, 'bloqueada')),
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
      motivo: 'Evaluación técnica solicitada por vencimiento de calibración.',
    });

    revalidatePath('/dashboard/panolero');
    revalidatePath('/dashboard/inspector');
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Panel de Pañolero
        </h1>
        <p className="mt-1.5 text-sm text-secondary">
          Gestión de inventario y flujo de préstamos.
        </p>
      </div>

      <ExpiredCalibrationList 
        expiredAssets={expiredAssets} 
        sendAction={sendToInspector} 
      />
      
      <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light flex items-center gap-2.5 bg-background/50">
          <PackageSearch className="w-5 h-5 text-secondary" />
          <h2 className="text-sm font-semibold text-primary">
            Inventario de Activos
          </h2>
        </div>
        <div className="p-0 sm:p-2">
          <InventoryList />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-light flex items-center gap-2.5 bg-background/50">
            <ClipboardCheck className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-semibold text-primary">
              Solicitudes Pendientes
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-auto bg-background/20">
            <PendingApprovals />
          </div>
        </section>

        <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-light flex items-center gap-2.5 bg-background/50">
            <ArrowLeftRight className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-semibold text-primary">
              Inspecciones de Devolución
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-auto bg-background/20">
            <PendingReturns />
          </div>
        </section>
      </div>
    </div>
  );
}
