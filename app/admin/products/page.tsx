'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ArrowLeft, 
  Tag, 
  DollarSign, 
  Filter,
  Loader2 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Timestamp } from 'firebase/firestore';

// Componentes Reutilizables (Asegúrate de que las rutas sean correctas)
import Container from '@/app/components/Container';
import ProductCard from '@/app/components/ProductCard';
import EditProductModal from '@/app/components/EditProductModal';
import SearchInput from '@/app/components/SearchInput';
import CategoryFilter from '@/app/components/CategoryFilter';
import CreateProductBtn from '@/app/components/CreateProductBtn';

// Firebase
import { 
  getAllProducts, 
  updateProduct, 
  deleteProduct 
} from '@/firebase/products';
import { 
  getAllCategories 
} from '@/firebase/categories';

// --- Interfaces ---
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

interface Categoria {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productosData, categoriasData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      
      setProductos(productosData as unknown as Producto[]);
      setCategorias(categoriasData as unknown as Categoria[]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudieron cargar los datos',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#F59E0B',
      });
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = 
      producto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || producto.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (actualizado: Producto) => {
    try {
      const result = await updateProduct(actualizado.id, {
        title: actualizado.title,
        description: actualizado.description,
        price: Number(actualizado.price),
        stock: Number(actualizado.stock),
        category: actualizado.category,
        images: actualizado.images
      });

      if (result.success) {
        setProductos(prev => prev.map(p => 
          p.id === actualizado.id ? { ...actualizado, updatedAt: Timestamp.now() } : p
        ));
        
        Swal.fire({
          title: '¡Producto actualizado!',
          text: 'Los cambios han sido guardados exitosamente',
          icon: 'success',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo actualizar el producto',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#F59E0B',
      });
      throw error;
    }
  };

  const handleDelete = async (producto: Producto) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar "${producto.title}"?`,
      icon: 'warning',
      background: '#0a0a0a',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteProduct(producto.id);
        if (deleteResult.success) {
          setProductos(productos.filter(p => p.id !== producto.id));
          Swal.fire({
            title: '¡Eliminado!',
            icon: 'success',
            background: '#0a0a0a',
            color: '#ffffff',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error: any) {
        // ... handling error
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-pedal-bgMain pt-24 flex justify-center items-center">
          <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-pedal-bgMain pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* --- Header --- */}
          <div className="mb-10 flex justify-between items-center">
            <h1 className="font-syne font-bold text-4xl md:text-5xl text-white tracking-tight">
              Inventario
            </h1>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-pedal-primary-glow hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </Link>
          </div>

          {/* --- Barra de Herramientas (Búsqueda y Acciones) --- */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <SearchInput 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              placeholder="Buscar productos por nombre, categoría o descripción..."
              className="md:w-2/3"
            />
            
            <div className="md:w-1/3 flex gap-3">
              <button
                onClick={() => setShowFilterBar(!showFilterBar)}
                className={`w-1/3 flex items-center justify-center gap-2 border border-white/10 rounded-xl py-3 px-4 text-white transition-all ${
                  showFilterBar ? 'bg-white/20 border-pedal-primary-glow/50' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              <CreateProductBtn />
            </div>
          </div>

          {/* --- Filtro de Categorías Expandible --- */}
          <AnimatePresence>
            {showFilterBar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CategoryFilter 
                  categorias={categorias}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Stats Cards --- */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 min-w-max md:grid md:grid-cols-3 md:min-w-0">
              {/* Total Productos */}
              <div className="bg-pedal-bgSurface rounded-2xl p-4 border border-pedal-primary-glow/10 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-pedal-primary-glow/10 p-2 rounded-xl">
                      <Package className="w-5 h-5 text-pedal-primary-glow" />
                    </div>
                    <p className="text-white/50 text-sm">Productos</p>
                  </div>
                  <p className="font-bold text-2xl text-white">{productos.length}</p>
                </div>
              </div>

              {/* Total Categorías */}
              <div className="bg-pedal-bgSurface rounded-2xl p-4 border border-pedal-primary-glow/10 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-pedal-primary-glow/10 p-2 rounded-xl">
                      <Tag className="w-5 h-5 text-pedal-primary-glow" />
                    </div>
                    <p className="text-white/50 text-sm">Categorías</p>
                  </div>
                  <p className="font-bold text-2xl text-white">{categorias.length}</p>
                </div>
              </div>

              {/* Valor Total Inventario */}
              <div className="bg-pedal-bgSurface rounded-2xl p-4 border border-pedal-primary-glow/10 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-pedal-primary-glow/10 p-2 rounded-xl">
                      <DollarSign className="w-5 h-5 text-pedal-primary-glow" />
                    </div>
                    <p className="text-white/50 text-sm">Valor Total</p>
                  </div>
                  <p className="font-bold text-xl text-white">
                    ${productos.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Grid de Productos --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProductos.map((producto, index) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* --- Empty State --- */}
          {filteredProductos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20"
            >
              <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/50 text-lg">No se encontraron productos</p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4 text-pedal-primary-glow hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* --- Modales --- */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isModalOpen}
          producto={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateProduct}
        />
      )}
    </Container>
  );
}