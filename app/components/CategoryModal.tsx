'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import type { Category } from '@/firebase/categories';

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name: string;
  description: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  modalMode: 'view' | 'edit' | 'create';
  selectedCategory: Category | null;
  formData: FormData;
  formErrors: FormErrors;
  onClose: () => void;
  onSave: () => void;
  onDelete: (category: Category) => void;
  onEditClick: () => void;
  onFormChange: (data: FormData) => void;
}

export default function CategoryModal({
  isOpen,
  modalMode,
  selectedCategory,
  formData,
  formErrors,
  onClose,
  onSave,
  onDelete,
  onEditClick,
  onFormChange,
}: CategoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-pedal-bgSurface rounded-3xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="font-syne font-bold text-2xl text-white">
                {modalMode === 'create' && 'Nueva Categoría'}
                {modalMode === 'view' && selectedCategory?.name}
                {modalMode === 'edit' && 'Editar Categoría'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {modalMode === 'view' && selectedCategory && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Descripción</label>
                    <p className="text-white text-lg leading-relaxed">
                      {selectedCategory.description || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {selectedCategory.createdAt && (
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <label className="block text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Creado</label>
                        <p className="text-white/80 text-sm">
                          {new Date(selectedCategory.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedCategory.updatedAt && (
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <label className="block text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Actualizado</label>
                        <p className="text-white/80 text-sm">
                          {new Date(selectedCategory.updatedAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={onEditClick}
                      className="flex-1 bg-pedal-primary-glow hover:bg-amber-600 text-black font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Editar Detalles
                    </button>
                    <button
                      onClick={() => {
                        // No cerramos el modal aquí, dejamos que el confirmDialog lo maneje o se cierre tras éxito
                        onDelete(selectedCategory);
                      }}
                      className="px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-2xl transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="space-y-6">
                  {modalMode === 'edit' && (
                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-amber-500/80 text-xs leading-relaxed">
                        Nota: Si cambias el nombre de la categoría, el identificador único también cambiará.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-white/30 text-xs font-bold uppercase tracking-widest mb-2 px-1">Nombre de la Categoría</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                      className={`w-full bg-white/5 border ${
                        formErrors.name ? 'border-red-500' : 'border-white/10'
                      } rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-4 focus:ring-pedal-primary-glow/10 transition-all`}
                      placeholder="Ej: Accesorios de Ruta"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-2 px-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/30 text-xs font-bold uppercase tracking-widest mb-2 px-1">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                      className={`w-full bg-white/5 border ${
                        formErrors.description ? 'border-red-500' : 'border-white/10'
                      } rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-4 focus:ring-pedal-primary-glow/10 transition-all resize-none`}
                      rows={5}
                      placeholder="Describe qué tipo de productos se encuentran en esta categoría..."
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-2 px-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={onSave}
                      className="flex-1 bg-pedal-primary-glow hover:bg-amber-600 text-black font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20"
                    >
                      {modalMode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}