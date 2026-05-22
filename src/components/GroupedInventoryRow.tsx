'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Clock, AlertTriangle, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function GroupedInventoryRow({ group }: { group: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'text-green-700 bg-green-50 border-green-200';
      case 'en_uso': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'bloqueada': return 'text-red-700 bg-red-50 border-red-200';
      case 'en_evaluacion': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <>
      <tr 
        className="hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="px-4 py-4 text-slate-400">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-slate-900">{group.nombre}</div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
          {group.categoria.replace('_', ' ')}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            {group.stats.disponible > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                {group.stats.disponible} DISP
              </span>
            )}
            {group.stats.en_uso > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {group.stats.en_uso} USO
              </span>
            )}
            {group.stats.bloqueada > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                {group.stats.bloqueada} BLOQ
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
          {group.items.length}
        </td>
      </tr>
      
      {isOpen && (
        <tr className="bg-slate-50/50">
          <td colSpan={5} className="px-4 py-4">
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-inner">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">ID / Tag</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Ubicación</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Vence Calib.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.items.map((item: any) => {
                    const isVencido = item.fechaVencimientoCalibracion && new Date(item.fechaVencimientoCalibracion) < new Date();
                    return (
                      <tr key={item.id} className="text-xs hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono text-slate-500">{item.id.slice(0, 8)}...</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border ${getStatusColor(item.estado)}`}>
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">{item.ubicacionFisica}</td>
                        <td className="px-4 py-2 font-medium">
                          {item.fechaVencimientoCalibracion ? (
                            <span className={isVencido ? 'text-red-600' : 'text-slate-600'}>
                              {format(new Date(item.fechaVencimientoCalibracion), 'dd/MM/yy', { locale: es })}
                              {isVencido && ' ⚠️'}
                            </span>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
