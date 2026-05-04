interface Categoria {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categorias: Categoria[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({ 
  categorias, 
  selectedCategory, 
  setSelectedCategory 
}: CategoryFilterProps) {
  return (
    <div className="mb-8 bg-white/5 rounded-xl p-4 animate-in slide-in-from-top duration-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white/70 text-sm">Filtrar por categoría:</h3>
        <button
          onClick={() => setSelectedCategory('all')}
          className="text-sm text-pedal-primary-glow hover:text-amber-400"
        >
          Limpiar filtros
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            selectedCategory === 'all'
              ? 'bg-pedal-primary-glow text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Todos
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => setSelectedCategory(categoria.name)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === categoria.name
                ? 'bg-pedal-primary-glow text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {categoria.name}
          </button>
        ))}
      </div>
    </div>
  );
}