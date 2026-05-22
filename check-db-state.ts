import { db } from './src/lib/db';
import { assets, loans } from './src/lib/db/schema';
import { eq, or } from 'drizzle-orm';

async function checkStates() {
  const pendingAssets = await db.select().from(assets).where(
    or(
      eq(assets.estado, 'bloqueada'),
      eq(assets.estado, 'en_evaluacion')
    )
  );
  
  console.log('Activos pendientes de evaluación:', pendingAssets);

  const activeLoans = await db.select().from(loans).where(eq(loans.cierreValidado, false));
  console.log('Préstamos activos/pendientes:', activeLoans);
}

checkStates();
