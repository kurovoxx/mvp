'use client';

import { useState } from 'react';
import { AlertCircle, Send, ShieldAlert, ChevronDown, ChevronRight, CalendarOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpiredAsset {
  id: string;
  nombre: string;
  estado: string;
  ubicacionFisica: string;
  fechaVencimientoCalibracion: Date | null;
}

interface ExpiredCalibrationListProps {
  expiredAssets: ExpiredAsset[];
  sendAction: (formData: FormData) => Promise<void>;
}

export default function ExpiredCalibrationList({ 
  expiredAssets, 
  sendAction 
}: ExpiredCalibrationListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (expiredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-500">No hay activos vencidos</p>
        <p className="text-xs text-slate-400 mt-1">Todas las herramientas disponibles tienen calibración vigente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-red-50/50 hover:bg-red-50 transition-colors border-b border-slate-200"
      >
        <div className="flex items-center gap-2.5">
          <CalendarOff className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Alertas de Calibración Vencida ({expiredAssets.length})
          </h2>
        </div>
        {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto bg-background/20">
          {expiredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{asset.nombre}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      {asset.estado}
                    </span>
                  </div>
                  <p className="text-xs text-red-700 font-medium mt-0.5">
                    Venció el {asset.fechaVencimientoCalibracion ? format(new Date(asset.fechaVencimientoCalibracion), "d 'de' MMMM, yyyy", { locale: es }) : 'N/A'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 uppercase font-bold">
                      {asset.ubicacionFisica}
                    </span>
                  </div>
                </div>
              </div>

              <form action={sendAction}>
                <input type="hidden" name="assetId" value={asset.id} />
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Send size={14} />
                  Enviar a Inspector
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
