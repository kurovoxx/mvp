import { db } from './src/lib/db';
import { assets, loans } from './src/lib/db/schema';
import { eq, ne } from 'drizzle-orm';

async function cleanup() {
  console.log('--- Iniciando Limpieza de Base de Datos ---');
  
  // 1. Resetear todos los activos a 'disponible'
  const assetsUpdated = await db.update(assets)
    .set({ estado: 'disponible' })
    .returning();
  
  console.log(`✅ ${assetsUpdated.length} activos reseteados a 'disponible'.`);

  // 2. Cerrar todos los préstamos pendientes para evitar ruidos
  const loansUpdated = await db.update(loans)
    .set({ cierreValidado: true })
    .where(ne(loans.cierreValidado, true))
    .returning();

  console.log(`✅ ${loansUpdated.length} préstamos pendientes marcados como validados/cerrados.`);
  
  console.log('--- Limpieza completada ---');
}

cleanup().catch(console.error);
