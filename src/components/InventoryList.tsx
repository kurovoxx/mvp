import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { GroupedInventoryRow } from './GroupedInventoryRow';

export default async function InventoryList() {
  const allAssets = await db.query.assets.findMany({
    orderBy: [desc(assets.nombre)],
  });

  // Group assets by name and category
  const groups = allAssets.reduce((acc, asset) => {
    const key = `${asset.nombre}-${asset.categoria}`;
    if (!acc[key]) {
      acc[key] = {
        nombre: asset.nombre,
        categoria: asset.categoria,
        items: [],
        stats: {
          disponible: 0,
          en_uso: 0,
          bloqueada: 0,
          otros: 0,
        }
      };
    }
    acc[key].items.push(asset);
    
    if (asset.estado === 'disponible') acc[key].stats.disponible++;
    else if (asset.estado === 'en_uso') acc[key].stats.en_uso++;
    else if (asset.estado === 'bloqueada' || asset.estado === 'en_evaluacion') acc[key].stats.bloqueada++;
    else acc[key].stats.otros++;
    
    return acc;
  }, {} as Record<string, any>);

  const groupedData = Object.values(groups);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-10"></th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumen de Estado</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {groupedData.map((group: any) => (
            <GroupedInventoryRow key={`${group.nombre}-${group.categoria}`} group={group} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
