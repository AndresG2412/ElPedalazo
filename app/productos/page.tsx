'use client';

import { useState, useEffect } from 'react';
import ProductListCliente from '@/app/components/ProductListCl';
import { getAllProducts, Product } from '@/firebase/products';
import { getAllCategories, Category } from '@/firebase/categories';
import { Loader2 } from 'lucide-react';
import Container from '@/app/components/Container';
import Swal from 'sweetalert2';

export default function Productos() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosData, categoriasData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProductos(productosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos. Por favor intenta de nuevo más tarde.',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (producto: Product) => {
    // Lógica para agregar al carrito (puedes expandir esto después)
    console.log('Agregar al carrito:', producto);
    Swal.fire({
      icon: 'success',
      title: 'Producto añadido',
      text: `${producto.title} se ha añadido al carrito.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#161616',
      color: '#ffffff',
    });
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-pedal-bgMain pt-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin mb-4" />
          <p className="text-white/60 animate-pulse font-syne">Preparando el catálogo...</p>
        </div>
      </Container>
    );
  }

  return (
    <ProductListCliente 
      productos={productos}
      categorias={categorias}
      onAddToCart={handleAddToCart}
    />
  );
}