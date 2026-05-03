'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-pedal-bgSurface rounded-3xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="font-syne font-bold text-2xl text-white">
                {modalMode === 'create' && 'Nueva Categoría'}
                {modalMode === 'view' && selectedCategory?.name}
                {modalMode === 'edit' && `Editar: ${selectedCategory?.name}`}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalMode === 'view' && selectedCategory && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Descripción</label>
                    <p className="text-white">{selectedCategory.description || 'Sin descripción'}</p>
                  </div>
                  {selectedCategory.createdAt && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Fecha de creación</label>
                      <p className="text-white">
                        {new Date(selectedCategory.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedCategory.updatedAt && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Última actualización</label>
                      <p className="text-white">
                        {new Date(selectedCategory.updatedAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={onEditClick}
                      className="flex-1 bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onDelete(selectedCategory);
                      }}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-xl transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                      className={`w-full bg-white/5 border ${
                        formErrors.name ? 'border-red-500' : 'border-white/10'
                      } rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all`}
                      placeholder="Ej: Electrónicos"
                      disabled={modalMode === 'edit'}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Descripción *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                      className={`w-full bg-white/5 border ${
                        formErrors.description ? 'border-red-500' : 'border-white/10'
                      } rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all resize-none`}
                      rows={4}
                      placeholder="Describe la categoría..."
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={onSave}
                      className="flex-1 bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all"
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