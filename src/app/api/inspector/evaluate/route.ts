import { db } from '@/lib/db';
import { assets, loans, technicalEvaluations, stateHistory } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.rol !== 'inspector') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { assetId, loanId, clasificacionCausa, descripcionTecnica, dictamen, requiereAccionRRHH } = await req.json();

  try {
    // 1. Obtener estado anterior
    const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
    const estadoAnterior = asset.estado;

    // 2. Determinar nuevo estado del activo según dictamen
    let nuevoEstado: any = 'disponible';
    if (dictamen === 'mantencion') nuevoEstado = 'en_reparacion';
    if (dictamen === 'baja') nuevoEstado = 'baja';
    if (dictamen === 'reposicion') nuevoEstado = 'baja'; // O un estado nuevo si existiera

    // 3. Registrar evaluación técnica si hay un préstamo asociado
    if (loanId) {
      await db.insert(technicalEvaluations).values({
        id: randomUUID(),
        prestamoId: loanId,
        inspectorId: session.user.id,
        clasificacionCausa,
        descripcionTecnica,
        dictamen,
        requiereAccionRRHH,
      });

      // Si se reincorpora o se da de baja, cerramos el préstamo
      await db.update(loans).set({
        cierreValidado: true,
        fechaHoraDevolucion: new Date(), // Aseguramos que tenga fecha de fin
      }).where(eq(loans.id, loanId));
    }

    // 4. Actualizar activo
    await db.update(assets).set({
      estado: nuevoEstado,
    }).where(eq(assets.id, assetId));

    // 5. Registrar en historial
    await db.insert(stateHistory).values({
      id: randomUUID(),
      activoId: assetId,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      usuarioResponsableId: session.user.id,
      motivo: `Dictamen Inspector: ${dictamen}. Causa: ${clasificacionCausa}. ${descripcionTecnica}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in evaluation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
