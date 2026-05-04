import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CreateCategoryBtn({ label = "Nueva Categoría" }: { label?: string }) {
  return (
    <Link
      href="/admin/categories/newCategory"
      className="bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
    >
      <Plus className="w-5 h-5" />
      {label}
    </Link>
  );
}