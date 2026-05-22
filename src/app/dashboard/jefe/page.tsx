export default function JefeDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Panel de Jefe de Turno</h1>
      <p className="mt-2 text-slate-600">Gestión de usuarios, inventario y alertas del sistema.</p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder stats */}
        {[
          { label: 'Usuarios Activos', value: '12', color: 'bg-blue-500' },
          { label: 'Activos Totales', value: '145', color: 'bg-green-500' },
          { label: 'Préstamos Hoy', value: '28', color: 'bg-amber-500' },
          { label: 'Alertas Críticas', value: '3', color: 'bg-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
            <div className={`mt-4 h-1 w-full rounded-full ${stat.color}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
