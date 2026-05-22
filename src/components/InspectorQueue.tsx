import { db } from '@/lib/db';
import { assets, loans, users } from '@/lib/db/schema';
import { eq, or, desc, and } from 'drizzle-orm';
import TechnicalEvaluationForm from './TechnicalEvaluationForm';

export default async function InspectorQueue() {
  const pendingAssets = await db
    .select({
      asset: assets,
      loan: loans,
      mecanico: users,
    })
    .from(assets)
    .leftJoin(loans, and(
      eq(assets.id, loans.activoId),
      eq(loans.cierreValidado, false)
    ))
    .leftJoin(users, eq(loans.mecanicoId, users.id))
    .where(
      or(
        eq(assets.estado, 'bloqueada'),
        eq(assets.estado, 'en_evaluacion')
      )
    )
    .orderBy(desc(assets.createdAt));

  if (pendingAssets.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p className="text-slate-500">No hay activos pendientes de evaluación técnica.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {pendingAssets.map(({ asset, loan, mecanico }) => (
        <div key={asset.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{asset.nombre}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    asset.estado === 'bloqueada' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {asset.estado === 'bloqueada' ? 'BLOQUEADA EN SALIDA' : 'EN EVALUACIÓN POR DAÑO'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">ID: {asset.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400 uppercase">Ubicación</p>
                <p className="text-sm font-medium text-slate-700">{asset.ubicacionFisica}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase">Categoría</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{asset.categoria.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Criticidad</p>
                <p className={`text-sm font-bold ${
                  asset.nivelCriticidad === 'alta' ? 'text-red-600' : 
                  asset.nivelCriticidad === 'media' ? 'text-amber-600' : 'text-blue-600'
                } capitalize`}>
                  {asset.nivelCriticidad}
                </p>
              </div>
            </div>

            {loan && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Mecánico responsable:</span> {mecanico?.nombre || 'No asignado'}
                </p>
                {loan.descripcionFallo && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                    <span className="font-bold">Fallo reportado:</span> {loan.descripcionFallo}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <TechnicalEvaluationForm 
                assetId={asset.id} 
                loanId={loan?.id || null} 
                assetName={asset.nombre} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
