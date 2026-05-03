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
      className="bg-pedal-bgSurface rounded-4xl border border-white/5 hover:border-pedal-primary-glow/30 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-syne font-bold text-xl text-white">
            {category.name}
          </h3>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="p-[15px] rounded-lg hover:bg-white/10 transition-colors"
            >
              <Edit2 className="w-5 h-5 text-white/60 hover:text-pedal-primary-glow" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              className="p-[15px] rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-white/60 hover:text-red-500" />
            </button>
          </div>
        </div>
        <p className="text-white/70 line-clamp-3">
          {category.description || 'Sin descripción'}
        </p>
        {category.createdAt && (
          <p className="text-white/30 text-sm mt-4">
            Creado: {new Date(category.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}