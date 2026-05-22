import InspectorQueue from '@/components/InspectorQueue';

export default function InspectorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Inspector (MyCal)</h1>
        <p className="mt-1 text-sm text-slate-600">Evaluación de daños, causa raíz y dictámenes técnicos de activos críticos.</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-6 text-red-600 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Cola de Evaluación Urgente
        </h2>
        <InspectorQueue />
      </div>
    </div>
  );
}
