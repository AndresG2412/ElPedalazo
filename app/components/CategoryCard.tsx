'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Category } from '@/firebase/categories';

interface CategoryCardProps {
  category: Category;
  index: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({ category, index, onEdit, onDelete }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-pedal-bgSurface rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-syne font-bold text-xl text-white group-hover:text-pedal-primary-glow transition-colors">
            {category.name}
          </h3>
        </div>
        <p className="text-white/50 text-sm line-clamp-2 mb-6 h-10">
          {category.description || 'Sin descripción'}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(category)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>
          <button
            onClick={() => onDelete(category)}
            className="flex items-center justify-center p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}