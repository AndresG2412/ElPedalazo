'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Category } from '@/firebase/categories';
import { p } from 'framer-motion/client';

interface CategoryCardProps {
  category: Category;
  index: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({ category, index, onEdit, onDelete }: CategoryCardProps) {
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-pedal-bgSurface rounded-4xl border border-white/5 overflow-hidden cursor-default"
    >
      <div className="px-6 py-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-syne font-bold text-xl text-white">
            {category.name}
          </h3>
        </div>
        <p className="text-white/70 line-clamp-2 mb-3">
          {category.description || 'Sin descripción'}
        </p>
        
        {/* botones de funciones */}
        <div className="flex gap-2 justify-between items-center mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="px-2 py-2 border flex gap-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors hover:text-pedal-primary-glow"
            >
              <Edit2 className="w-5 h-5" />
              <span className="">Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              className="px-2 py-2 border flex gap-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
              <span className="">Eliminar</span>
            </button>
          </div>
      </div>
    </motion.div>
  );
}