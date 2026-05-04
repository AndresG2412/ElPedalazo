import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CreateProductBtn() {
  return (
    <Link
      href="/admin/products/newProduct"
      className="w-full md:w-2/3 font-semibold bg-linear-to-r from-pedal-primary-glow to-amber-600 text-white px-3 py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
    >
      <Plus className="w-5 h-5" strokeWidth={3}/>
      Nuevo Producto
    </Link>
  );
}