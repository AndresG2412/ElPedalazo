'use client';

import { ShoppingCart, Package } from 'lucide-react';
import { Product } from '@/firebase/products';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface ProductCardClienteProps {
  producto: Product;
  index: number;
  onAddToCart: (producto: Product) => void;
}

export default function ProductCardCl({ producto, index, onAddToCart }: ProductCardClienteProps) {
  const hasImage = Boolean(producto.images?.[0]);
  const isLowStock = producto.stock <= 5 && producto.stock > 0;
  const isOutOfStock = producto.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    Swal.fire({
      title: '¡Enlistado en el carrito!',
      text: `"${producto.title}" fue añadido a tu carrito.`,
      icon: 'success',
      background: '#111111',
      color: '#ffffff',
      iconColor: '#E07820',
      confirmButtonColor: '#E07820',
      confirmButtonText: 'Continuar comprando',
    });

    onAddToCart(producto);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-pedal-bgSurface rounded-2xl border border-white/6 hover:border-pedal-primary-glow/35 transition-all duration-300 overflow-hidden flex flex-col group"
    >
      {/* Imagen */}
      <div className="relative h-38 shrink-0 bg-white/4 overflow-hidden">
        {hasImage ? (
          <img
            src={producto.images[0]}
            alt={producto.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[103%]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-white/15" />
          </div>
        )}

        {isLowStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
              ¡Pocas unidades!
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col gap-2 px-3 pt-4 pb-3 flex-1">
        {/* Categoría */}
        <span className="text-pedal-primary-glow text-[11px] font-bold tracking-widest uppercase opacity-80">
          {producto.category}
        </span>

        {/* Título completo sin truncar */}
        <h3 className="font-syne font-bold text-xl text-white leading-snug">
          {producto.title}
        </h3>

        {/* Footer: precio + botón carrito en la misma fila */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/6">
          <span className="text-pedal-primary-glow font-extrabold text-xl tracking-tight">
            ${producto.price.toLocaleString()}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isOutOfStock
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-pedal-primary-glow text-black hover:bg-amber-400 hover:scale-105 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Carrito
          </button>
        </div>
      </div>
    </motion.div>
  );
}