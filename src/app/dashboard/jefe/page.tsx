import { Users, Package, ArrowLeftRight, AlertTriangle } from 'lucide-react';

export default function JefeDashboard() {
  const stats = [
    { 
      label: 'Usuarios Activos', 
      value: '12', 
      icon: Users,
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10' 
    },
    { 
      label: 'Activos Totales', 
      value: '145', 
      icon: Package,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50' 
    },
    { 
      label: 'Préstamos Hoy', 
      value: '28', 
      icon: ArrowLeftRight,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50' 
    },
    { 
      label: 'Alertas Críticas', 
      value: '3', 
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50' 
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Panel de Jefe de Turno
        </h1>
        <p className="mt-1.5 text-sm text-secondary">
          Gestión de usuarios, inventario y alertas del sistema.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-surface p-6 rounded-xl border border-border-light shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-secondary">
                {stat.label}
              </p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-primary">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Espacio preparado para futuras expansiones (ej: Tablas de usuarios o alertas detalladas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <section className="lg:col-span-2 bg-surface rounded-xl border border-border-light shadow-sm min-h-[300px] flex flex-col">
          <div className="px-6 py-4 border-b border-border-light bg-background/50">
            <h2 className="text-sm font-semibold text-primary">Actividad Reciente</h2>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-secondary/60 border border-dashed border-border-light rounded-lg w-full py-12">
              El registro de actividad detallado se mostrará aquí
            </p>
          </div>
        </section>

        <section className="lg:col-span-1 bg-surface rounded-xl border border-border-light shadow-sm min-h-[300px] flex flex-col">
          <div className="px-6 py-4 border-b border-border-light bg-background/50">
            <h2 className="text-sm font-semibold text-primary">Alertas del Sistema</h2>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 text-center">
             <p className="text-sm text-secondary/60 border border-dashed border-border-light rounded-lg w-full py-12">
              Panel de alertas en desarrollo
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}