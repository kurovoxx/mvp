'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  assetId: string;
  loanId: string | null;
  assetName: string;
}

export default function TechnicalEvaluationForm({ assetId, loanId, assetName }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inspector/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          assetId,
          loanId,
          clasificacionCausa: formData.get('clasificacionCausa'),
          descripcionTecnica: formData.get('descripcionTecnica'),
          dictamen: formData.get('dictamen'),
          requiereAccionRRHH: formData.get('requiereAccionRRHH') === 'on',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert('Error al registrar la evaluación');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-slate-800 transition-colors"
      >
        Emitir Dictamen Técnico
      </button>
    );
  }

  return (
    <div className="mt-4 border-2 border-slate-900 rounded-xl p-5 bg-slate-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-slate-900">Formulario de Evaluación: {assetName}</h4>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Clasificación de Causa Raíz
          </label>
          <select
            name="clasificacionCausa"
            required
            className="w-full rounded-lg border-slate-300 text-sm focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="desgaste_natural">Desgaste Natural (Uso normal)</option>
            <option value="negligencia">Negligencia / Mal uso</option>
            <option value="defecto_fabrica">Defecto de Fábrica</option>
            <option value="por_determinar">Por determinar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Descripción Técnica del Hallazgo
          </label>
          <textarea
            name="descripcionTecnica"
            required
            rows={3}
            placeholder="Detalle fisuras, fallos eléctricos, falta de calibración, etc."
            className="w-full rounded-lg border-slate-300 text-sm focus:ring-slate-900 focus:border-slate-900"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Dictamen Final
          </label>
          <select
            name="dictamen"
            required
            className="w-full rounded-lg border-slate-300 text-sm focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="reincorporar">Reincorporar (Vuelve a Disponible)</option>
            <option value="mantencion">Derivar a Mantención/Calibración</option>
            <option value="baja">Baja Técnica (Chatarra/Reposición)</option>
            <option value="reposicion">Solicitar Reposición Inmediata</option>
          </select>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            name="requiereAccionRRHH"
            id={`rrhh-${assetId}`}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor={`rrhh-${assetId}`} className="text-sm font-medium text-red-700">
            ¿Requiere informe a RRHH por negligencia?
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Finalizar Evaluación y Cerrar Caso'}
        </button>
      </form>
    </div>
  );
}
