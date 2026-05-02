'use client';

import { useState } from 'react';
import { 
  Tag, 
  FileText, 
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { createCategory } from '@/firebase/categories';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewCategory() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // ✅ Ahora createCategory NO lanza errores, retorna un objeto
      const result = await createCategory(formData);
      
      // ✅ Verificar si la operación fue exitosa
      if (!result.success) {
        // Manejar diferentes tipos de errores
        if (result.error?.code === 'DUPLICATE_NAME') {
          await Swal.fire({
            icon: 'error',
            title: 'Categoría Duplicada',
            text: result.error.message,
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        } else if (result.error?.code === 'REQUIRED_NAME') {
          await Swal.fire({
            icon: 'error',
            title: 'Nombre Requerido',
            text: result.error.message,
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        } else if (result.error?.code === 'PERMISSION_DENIED') {
          await Swal.fire({
            icon: 'error',
            title: 'Sin Permisos',
            text: result.error.message,
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.error?.message || 'No se pudo crear la categoría.',
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        }
        return; // ✅ Salir sin continuar
      }
      
      // ✅ Si llegamos aquí, la categoría se creó exitosamente
      setIsSuccess(true);
      
      await Swal.fire({
        icon: 'success',
        title: 'Categoría Creada',
        text: `La categoría "${formData.name}" ha sido registrada con éxito.`,
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fbbf24'
      });

      setFormData({ name: '', description: '' });
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);

      router.push('/admin/categories');
      
    } catch (error: any) {
      // ✅ Este catch solo captura errores INESPERADOS del sistema
      // (problemas de red, Firebase caído, errores de código, etc.)
      console.error('Error inesperado:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error Inesperado',
        text: 'Ocurrió un problema técnico. Por favor, intenta de nuevo más tarde.',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pedal-bgMain pt-16 flex items-center justify-center md:pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold font-syne tracking-tight text-white mb-3">
            Crear Categoría
          </h1>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="animate-fade-up animation-delay-200">
          {/* Tarjeta del Formulario */}
          <div className="bg-pedal-bgSurface/50 backdrop-blur-sm rounded-[2rem] border border-pedal-primary-glow/10 p-6 md:p-8 shadow-2xl">
            {/* Campo: Nombre de la Categoría */}
            <div className="mb-8">
              <label className="block text-white/70 font-syne text-sm font-semibold mb-3">
                <Tag className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                Nombre de la Categoría
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Electrónica, Ropa, Accesorios..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl
                  text-white placeholder-white/30 text-lg focus:outline-none 
                  focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 
                  transition-all duration-300"
                required
                autoFocus
              />
              <p className="text-white/40 text-sm mt-2 ml-1">
                El nombre debe ser único y descriptivo
              </p>
            </div>

            {/* Campo: Descripción de la Categoría */}
            <div className="mb-8">
              <label className="block text-white/70 font-syne text-sm font-semibold mb-3">
                <FileText className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe qué tipo de productos pertenecen a esta categoría..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl
                  text-white placeholder-white/30 focus:outline-none 
                  focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 
                  transition-all duration-300 resize-none"
                required
              />
              <p className="text-white/40 text-sm mt-2 ml-1">
                Una buena descripción ayuda a los clientes a encontrar productos fácilmente
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
              <Link
                href='/admin/categories'
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 
                  text-white/70 font-syne font-semibold transition-all duration-300 
                  hover:scale-[1.02] hover:bg-white/10 hover:border-white/20
                  flex items-center justify-center gap-2"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-pedal-primary-glow to-amber-600
                  text-black font-syne font-bold transition-all duration-300 
                  hover:scale-[1.02] hover:shadow-lg hover:shadow-pedal-primary-glow/25
                  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>¡Creada!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Crear Categoría</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}