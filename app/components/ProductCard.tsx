'use client';

import { Package, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditProductModal from "@/app/components/EditProductModal"

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
  onDelete: (producto: Producto) => void;
  onSave: (productoActualizado: Producto) => Promise<void>;
}

export default function ProductCard({ producto, onDelete, onSave }: ProductCardProps) {
  const [editando, setEditando] = useState(false);
  const hasImage = Boolean(producto.images?.[0]);

  return (
    <>
      <div className="bg-pedal-bgSurface rounded-xl border border-white/6 hover:border-pedal-primary-glow/35 transition-all duration-200 overflow-hidden flex flex-col group animate-in fade-in zoom-in">

        <div className="relative h-40 shrink-0 bg-white/4">
          {hasImage ? (
            <img
              src={producto.images[0]}
              alt={producto.title}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-white/15" />
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-4">
            <button
              onClick={() => setEditando(true)}
              className="w-[35px] h-[35px] flex items-center justify-center rounded-[7px] hover:scale-105 transition-transform duration-200 bg-black border-[1.5px] text-white/70 backdrop-blur-sm"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(producto)}
              className="w-[35px] h-[35px] flex items-center justify-center rounded-[7px] hover:scale-105 transition-transform duration-200 bg-black border-[1.5px] text-red-400 backdrop-blur-sm"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5 flex-1">
          <span className="text-pedal-primary-glow text-[10px] font-semibold tracking-widest uppercase opacity-80">
            {producto.category}
          </span>

          <h3 className="font-syne font-bold text-xl text-white leading-snug truncate">
            {producto.title}
          </h3>

          <p className="text-white/45 text-xs leading-relaxed line-clamp-2 shrink-0">
            {producto.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-white/6">
            <span className="text-pedal-primary-glow font-extrabold text-[17px] tracking-tight">
              ${producto.price}
            </span>
            <span className="text-white/40 text-[11px] bg-white/5 rounded-[5px] px-2 py-0.5">
              Stock: {producto.stock ?? 0}
            </span>
          </div>
        </div>
      </div>

      {editando && (
        <EditProductModal
          producto={producto}
          onClose={() => setEditando(false)}
          onSave={async (actualizado) => {
            await onSave(actualizado);
            setEditando(false);
          }}
        />
      )}
    </>
  );
}