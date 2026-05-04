'use client';

import { useState, useEffect, useMemo } from 'react';
import Container from "./Container";
import CategoryFilter from "./CategoryFilter";
import SearchInput from "./SearchInput";
import ProductCardCliente from "./ProductCardCl";

import { Product } from '@/firebase/products';

interface ProductListClienteProps {
  productos: Product[];
  categorias: { id: string; name: string }[];
  onAddToCart: (producto: Product) => void;
}

import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductListCliente({ 
  productos, 
  categorias, 
  onAddToCart 
}: ProductListClienteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Detectar tamaño de pantalla para ajustar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(12);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return productos.filter(producto => {
      const matchesCategory = selectedCategory === 'all' || producto.category === selectedCategory;
      const matchesSearch = producto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           producto.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productos, selectedCategory, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Funciones de navegación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-24 pb-20">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h1 className="font-syne font-black text-4xl md:text-5xl tracking-tight text-white">
            Nuestros <span className="text-pedal-primary-glow">Productos</span>
          </h1>
        </div>

        {/* Barra de búsqueda y Botón de Filtro */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar por nombre o descripción..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              showFilters || selectedCategory !== 'all'
                ? 'bg-pedal-primary-glow text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Filter size={20} />
            {selectedCategory !== 'all' ? `Categoría: ${selectedCategory}` : 'Filtros'}
          </button>
        </div>

        {/* Interfaz de Selección de Categoría (Condicional) */}
        {showFilters && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <CategoryFilter 
              categorias={categorias}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                // Opcional: cerrar filtros al seleccionar uno en móvil
                if (window.innerWidth < 768) setShowFilters(false);
              }}
            />
          </div>
        )}

        {/* Resultados */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <p className="text-white/40 text-lg mb-4">
              No encontramos lo que buscas.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="text-pedal-primary-glow hover:underline font-bold"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {currentProducts.map((producto, idx) => (
                <ProductCardCliente
                  key={producto.id}
                  producto={producto}
                  index={idx}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {/* Paginación Refinada */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 mt-16">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isCurrent = currentPage === page;
                      // Lógica para mostrar solo algunas páginas si hay muchas
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-12 h-12 rounded-xl font-bold transition-all ${
                              isCurrent
                                ? 'bg-pedal-primary-glow text-black shadow-lg shadow-pedal-primary-glow/20'
                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="text-white/20 self-end mb-3">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <p className="text-white/30 text-sm font-medium">
                  Página {currentPage} de {totalPages} <span className="mx-2">•</span> {filteredProducts.length} productos en total
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}