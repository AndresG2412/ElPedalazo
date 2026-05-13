'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Marca } from '@/firebase/marcas';

interface MarcaCardProps {
  marca: Marca;
  index: number;
  onEdit: (marca: Marca) => void;
  onDelete: (marca: Marca) => void;
}

export default function MarcaCard({ marca, index, onEdit, onDelete }: MarcaCardProps) {
  return (
    <motion.div
      key={marca.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-pedal-bgSurface w-full px-6 py-6 rounded-4xl border border-white/5 cursor-default"
    >
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-syne font-bold text-xl text-white">
            {marca.name}
          </h3>
        </div>
        
        {/* botones de funciones */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(marca);
              }}
              className="px-3 py-2 border flex items-center gap-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors hover:text-pedal-primary-glow"
            >
              <Edit2 className="w-5 h-5" />
              <span>Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(marca);
              }}
              className="px-3 py-2 border flex items-center gap-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          </div>
      </div>
    </motion.div>
  );
}
