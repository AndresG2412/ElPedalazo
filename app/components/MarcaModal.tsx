'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Marca } from '@/firebase/marcas';

interface FormData {
  name: string;
}

interface FormErrors {
  name: string;
}

interface MarcaModalProps {
  isOpen: boolean;
  modalMode: 'view' | 'edit' | 'create';
  selectedMarca: Marca | null;
  formData: FormData;
  formErrors: FormErrors;
  onClose: () => void;
  onSave: () => void;
  onDelete: (marca: Marca) => void;
  onEditClick: () => void;
  onFormChange: (data: FormData) => void;
}

export default function MarcaModal({
  isOpen,
  modalMode,
  selectedMarca,
  formData,
  formErrors,
  onClose,
  onSave,
  onDelete,
  onEditClick,
  onFormChange,
}: MarcaModalProps) {
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
                {modalMode === 'create' && 'Nueva Marca'}
                {modalMode === 'view' && selectedMarca?.name}
                {modalMode === 'edit' && `Editar: ${selectedMarca?.name}`}
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
              {modalMode === 'view' && selectedMarca && (
                <div className="space-y-4">
                  {selectedMarca.createdAt && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Fecha de creación</label>
                      <p className="text-white">
                        {new Date(selectedMarca.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedMarca.updatedAt && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Última actualización</label>
                      <p className="text-white">
                        {new Date(selectedMarca.updatedAt.seconds * 1000).toLocaleString()}
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
                        onDelete(selectedMarca);
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
                      placeholder="Ej: Shimano"
                      disabled={modalMode === 'edit'}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
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
