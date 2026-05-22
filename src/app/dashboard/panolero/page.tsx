import InventoryList from '@/components/InventoryList';
import PendingApprovals from '@/components/PendingApprovals';
import PendingReturns from '@/components/PendingReturns';

export default function PanoleroDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Pañolero</h1>
          <p className="mt-1 text-sm text-slate-600">Gestión de inventario y flujo de préstamos.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Inventario de Activos</h3>
        </div>
        <InventoryList />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Solicitudes Pendientes</h2>
          <PendingApprovals />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Inspecciones de Devolución</h2>
          <PendingReturns />
        </div>
      </div>
    </div>
  );
}
