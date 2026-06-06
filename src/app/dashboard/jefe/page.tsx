import { Users, Package, ArrowLeftRight, AlertTriangle, Clock, Activity } from 'lucide-react';
import { db } from '@/lib/db';
import { users, assets, loans, stateHistory } from '@/lib/db/schema';
import { eq, or, desc, count } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CreateUserForm from '@/components/CreateUserForm';
import Link from 'next/link';

export default async function JefeDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  // Configuración de la paginación
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const limit = 5; // Límite de 4 usuarios por página
  const offset = (page - 1) * limit;

  // Consultas de métricas globales
  const [activeUsers] = await db.select({ value: count() }).from(users).where(eq(users.activo, true));
  const [totalAssets] = await db.select({ value: count() }).from(assets);
  const [activeLoans] = await db.select({ value: count() }).from(loans).where(eq(loans.cierreValidado, false));
  const [criticalAlerts] = await db.select({ value: count() })
    .from(assets)
    .where(or(eq(assets.estado, 'bloqueada'), eq(assets.estado, 'en_evaluacion')));

  // Actividad Reciente
  const recentActivity = await db
    .select({
      id: stateHistory.id,
      estadoAnterior: stateHistory.estadoAnterior,
      estadoNuevo: stateHistory.estadoNuevo,
      motivo: stateHistory.motivo,
      fecha: stateHistory.createdAt,
      activoNombre: assets.nombre,
      usuarioNombre: users.nombre
    })
    .from(stateHistory)
    .leftJoin(assets, eq(stateHistory.activoId, assets.id))
    .leftJoin(users, eq(stateHistory.usuarioResponsableId, users.id))
    .orderBy(desc(stateHistory.createdAt))
    .limit(5);

  // Alertas Críticas
  const alertsList = await db
    .select({
      id: assets.id,
      nombre: assets.nombre,
      estado: assets.estado,
      ubicacion: assets.ubicacionFisica
    })
    .from(assets)
    .where(or(eq(assets.estado, 'bloqueada'), eq(assets.estado, 'en_evaluacion')))
    .limit(5);

  // Consulta del Directorio de Usuarios CON Paginación
  const usersList = await db
    .select({
      id: users.id,
      nombre: users.nombre,
      email: users.email,
      rol: users.rol,
      activo: users.activo
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Calcular el total de páginas
  const [usersCountResult] = await db.select({ value: count() }).from(users);
  const totalPages = Math.ceil(usersCountResult.value / limit);

  const stats = [
    { 
      label: 'Usuarios Activos', 
      value: activeUsers.value.toString(), 
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Activos Totales', 
      value: totalAssets.value.toString(), 
      icon: Package,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50' 
    },
    { 
      label: 'Préstamos Activos', 
      value: activeLoans.value.toString(), 
      icon: ArrowLeftRight,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50' 
    },
    { 
      label: 'Alertas Críticas', 
      value: criticalAlerts.value.toString(), 
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50' 
    },
  ];

  const formatSafeDate = (dateVal: any) => {
    if (!dateVal) return "Fecha desconocida";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Hace un momento";
    return format(d, "d MMM, HH:mm", { locale: es });
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Panel de Jefe de Turno
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Supervisión global de inventario, flujo de préstamos y alertas operativas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600">
                {stat.label}
              </p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Actividad Reciente del Sistema</h2>
          </div>
          <div className="flex-1 overflow-auto">
            {recentActivity.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-sm text-slate-400 italic">No hay actividad registrada aún.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{activity.activoNombre}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Cambió de <span className="font-mono bg-slate-100 px-1 rounded">{activity.estadoAnterior}</span> a <span className="font-mono bg-slate-100 px-1 rounded">{activity.estadoNuevo}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-900">{activity.usuarioNombre}</p>
                        <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatSafeDate(activity.fecha)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-red-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-semibold text-red-900">Alertas Críticas</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                <div className="p-3 bg-green-50 rounded-full">
                  <Package className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-slate-500">No hay activos bloqueados o en evaluación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertsList.map((alert) => (
                  <div key={alert.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{alert.nombre}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {alert.estado.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-600">{alert.ubicacion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-1">
          <CreateUserForm />
        </div>
        
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Directorio de Personal</h2>
          </div>
          
          <div className="flex-1 overflow-auto p-0 flex flex-col justify-between">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-900">{u.nombre}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium uppercase text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {u.rol.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginador visual */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200 bg-slate-50">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/dashboard/jefe?page=${pageNum}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-all ${
                      pageNum === page
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}