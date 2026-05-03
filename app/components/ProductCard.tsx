'use client';

import { Package, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Producto {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: any;
  updatedAt: any;
}

interface ProductCardProps {
  producto: Producto;
  index: number;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

export default function ProductCard({ producto, index, onEdit, onDelete }: ProductCardProps) {
  const hasImage = Boolean(producto.images?.[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-pedal-bgSurface rounded-2xl border border-white/6 hover:border-pedal-primary-glow/35 transition-all duration-300 overflow-hidden flex flex-col group animate-in fade-in zoom-in cursor-pointer"
    >

      <div className="relative h-38 shrink-0 bg-white/4 overflow-hidden">
        {hasImage ? (
          <img
            src={producto.images[0]}
            alt={producto.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-white/15" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(producto)}
            className="p-[12px] bg-black/60 border border-white/10 rounded-xl text-white/70 backdrop-blur-md hover:bg-pedal-primary-glow hover:text-black transition-all"
            title="Editar"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(producto)}
            className="p-[12px] bg-black/60 border border-white/10 rounded-xl text-red-400 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col gap-2 px-2 pt-4 pb-2 flex-1">
        <span className="text-pedal-primary-glow text-[11px] font-bold tracking-widest uppercase opacity-80">
          {producto.category}
        </span>

        <h3 className="font-syne font-bold text-2xl text-white leading-tight group-hover:text-pedal-primary-glow transition-colors truncate">
          {producto.title}
        </h3>

        <p className="text-white/45 text-sm leading-relaxed line-clamp-2 shrink-0">
          {producto.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt- border-t border-white/6">
          <span className="text-pedal-primary-glow font-extrabold text-2xl tracking-tight">
            ${producto.price.toLocaleString()}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-white/40 text-[11px] bg-white/5 rounded-lg px-2.5 py-1 border border-white/5">
              Stock: {producto.stock ?? 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
