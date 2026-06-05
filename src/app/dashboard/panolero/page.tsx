import InventoryList from '@/components/InventoryList';
import PendingApprovals from '@/components/PendingApprovals';
import PendingReturns from '@/components/PendingReturns';
import ExpiredCalibrationList from '@/components/ExpiredCalibrationList';
import { PackageSearch, ClipboardCheck, ArrowLeftRight, CalendarOff } from 'lucide-react';

export default function PanoleroDashboard() {
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

      <section className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-light flex items-center gap-2.5 bg-red-50/50">
          <CalendarOff className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-semibold text-primary">
            Alertas de Calibración Vencida
          </h2>
        </div>
        <div className="p-6 flex-1 bg-background/20">
          <ExpiredCalibrationList />
        </div>
      </section>
      
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