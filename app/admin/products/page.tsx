'use client';

import Link from 'next/link';
import Container from '@/app/components/Container';
import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Tag,
  DollarSign,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import EditProductModal from '@/app/components/EditProductModal';
import { 
  getAllProducts, 
  updateProduct, 
  deleteProduct,
  Product as ProductFirebase
} from '@/firebase/products';
import { 
  getAllCategories, 
  Category as CategoryFirebase 
} from '@/firebase/categories';
import { Timestamp } from 'firebase/firestore';
import ProductCard from '@/app/components/ProductCard';

// Tipos basados en tu estructura de base de datos
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
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar productos y categorías desde la base de datos
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar productos y categorías en paralelo
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

  // Helper para mostrar fechas de Firestore
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  // Filtrar productos por búsqueda y categoría
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || producto.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  // Actualizar producto desde el modal
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
      } else {
        throw new Error('No se pudo actualizar el producto');
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

  // Eliminar producto
  const handleDelete = async (producto: Producto) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar "${producto.title}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      background: '#0a0a0a',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteProduct(producto.id);

        if (deleteResult.success) {
          setProductos(productos.filter(p => p.id !== producto.id));
          
          Swal.fire({
            title: '¡Producto eliminado!',
            text: 'El producto ha sido eliminado del inventario',
            icon: 'success',
            background: '#0a0a0a',
            color: '#ffffff',
            confirmButtonColor: '#F59E0B',
            timer: 2000
          });
        } else {
          throw new Error('No se pudo eliminar el producto');
        }
      } catch (error: any) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo eliminar el producto',
          icon: 'error',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
        });
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-pedal-bgMain pt-24 pb-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pedal-primary-glow"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
    <div className="min-h-screen bg-pedal-bgMain pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="mb-10 flex flex-row justify-between items-center md:items-center gap-4">
          <div>
            <h1 className="font-syne font-bold text-4xl md:text-5xl text-white tracking-tight">
              Inventario
            </h1>
          </div>
          
          <Link
            href="/admin"
            className="flex items-center gap-2 text-pedal-primary-glow hover:text-amber-600 transition-colors hover:scale-[1.02]"
            >
            <ArrowLeft className="w-5 h-5" />
            <span>Regresar</span>
          </Link>
        </div>

        {/* Search y Filtros en misma fila */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Input de búsqueda - 2/3 */}
          <div className="relative md:w-2/3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, categoría o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pedal-primary-glow/50 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Botón de filtros - 1/3 */}
          <div className="md:w-1/3 flex gap-3">
            <button
              onClick={() => setSelectedCategory(prev => prev === 'all' ? categorias[0]?.name || 'all' : 'all')}
              className="w-1/3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <Link
              href={'/admin/products/newProduct'}
              className="w-2/3 font-semibold bg-linear-to-r from-pedal-primary-glow to-amber-600 text-white px-3 py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" strokeWidth={3}/>
              Nuevo Producto
            </Link>
          </div>
        </div>

        {/* Categorías - Filtro (se muestra solo cuando hay filtro activo) */}
        {selectedCategory !== 'all' && (
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
        )}

        {/* Stats Cards */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max md:grid md:grid-cols-3 md:gap-4 md:min-w-0">

            <div className="bg-pedal-bgSurface rounded-2xl px-4 py-3 border border-pedal-primary-glow/20 transition-all w-[220px] md:w-auto cursor-default">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-pedal-primary-glow/10 p-2 rounded-xl shrink-0">
                    <Package className="w-4 h-4 text-pedal-primary-glow" />
                  </div>
                  <p className="text-white/50 text-sm">Total Productos</p>
                </div>
                <p className="font-bold text-2xl text-white">{productos.length}</p>
              </div>
            </div>

            <div className="bg-pedal-bgSurface rounded-2xl px-4 py-3 border border-pedal-primary-glow/20 transition-all w-[220px] md:w-auto cursor-default">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-pedal-primary-glow/10 p-2 rounded-xl shrink-0">
                    <Tag className="w-4 h-4 text-pedal-primary-glow" />
                  </div>
                  <p className="text-white/50 text-sm">Categorías</p>
                </div>
                <p className="font-bold text-2xl text-white">{categorias.length}</p>
              </div>
            </div>

            <div className="bg-pedal-bgSurface rounded-2xl px-4 py-3 border border-pedal-primary-glow/20 transition-all w-[220px] md:w-auto cursor-default">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-pedal-primary-glow/10 p-2 rounded-xl shrink-0">
                    <DollarSign className="w-4 h-4 text-pedal-primary-glow" />
                  </div>
                  <p className="text-white/50 text-sm">Valor Total</p>
                </div>
                <p className="font-bold text-2xl text-white">
                  ${productos.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredProductos.map((producto, index) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* No results */}
        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No se encontraron productos</p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-pedal-primary-glow hover:text-amber-400"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Modal */}
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