'use client';

import { useState, useRef } from 'react';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createUser } from '@/app/dashboard/jefe/actions';

export default function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estado para guardar los errores individuales de cada campo
  const [errors, setErrors] = useState<{ nombre?: string; email?: string; password?: string; rol?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleValidationAndSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setErrors({}); // Limpiamos errores previos

    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rol = formData.get('rol') as string;

    // 1. Validaciones del lado del cliente
    const newErrors: { nombre?: string; email?: string; password?: string; rol?: string } = {};
    
    if (!nombre || nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      newErrors.email = 'Ingrese un formato de correo válido (ej: usuario@faena.cl).';
    }
    
    if (!password || password.length < 6) {
      newErrors.password = 'La contraseña debe tener un mínimo de 6 caracteres.';
    }
    
    if (!rol) {
      newErrors.rol = 'Debe seleccionar un rol en el sistema.';
    }

    // Si hay errores, detenemos el envío y los mostramos en pantalla
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // 2. Envío al Servidor (si pasa las validaciones)
    const result = await createUser(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error }); // Errores del servidor (ej: correo ya existe)
    } else if (result?.success) {
      setMessage({ type: 'success', text: 'Usuario creado exitosamente.' });
      formRef.current?.reset(); // Limpia el formulario
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <UserPlus className="text-blue-600 w-5 h-5" />
        <h2 className="text-sm font-semibold text-slate-900">Registrar Nuevo Personal</h2>
      </div>

      <form ref={formRef} action={handleValidationAndSubmit} className="space-y-4">
        {/* Campo: Nombre */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
          <input 
            type="text" 
            name="nombre" 
            className={`w-full rounded-lg text-sm outline-none p-2 border transition-colors ${
              errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
            placeholder="Ej: Juan Pérez"
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
        </div>

        {/* Campo: Correo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
          <input 
            type="text" // Cambiado a text para que HTML5 no bloquee y actúe nuestra validación Regex
            name="email" 
            className={`w-full rounded-lg text-sm outline-none p-2 border transition-colors ${
              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
            placeholder="Ej: jperez@faena.cl"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Campo: Contraseña */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            name="password" 
            className={`w-full rounded-lg text-sm outline-none p-2 border transition-colors ${
              errors.password ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
        </div>

        {/* Campo: Rol */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rol en el Sistema</label>
          <select 
            name="rol" 
            className={`w-full rounded-lg text-sm outline-none p-2 border transition-colors bg-white ${
              errors.rol ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
          >
            <option value="">Seleccione un rol...</option>
            <option value="mecanico">Mecánico</option>
            <option value="pañolero">Pañolero</option>
            <option value="inspector">Inspector</option>
            <option value="jefe_turno">Jefe de Turno</option>
          </select>
          {errors.rol && <p className="text-xs text-red-600 mt-1">{errors.rol}</p>}
        </div>

        {/* Mensajes globales del servidor (Éxito o Error de Base de Datos) */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm mt-2 ${
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Botón de Envío */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-70 mt-6"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Validando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
}