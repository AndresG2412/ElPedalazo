'use client';

import { useState, useEffect } from 'react';
import ProductListCliente from '@/app/components/ProductListCl';
import { getAllProducts, Product } from '@/firebase/products';
import { getAllCategories, Category } from '@/firebase/categories';
import { Loader2 } from 'lucide-react';
import Container from '@/app/components/Container';
import Swal from 'sweetalert2';
import Footer from '../components/Footer';
import { auth } from '@/firebase/config';
import { saveCartToFirestore, getCartFromFirestore } from '@/firebase/cart';

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

  const handleAddToCart = async (producto: Product) => {
    // 1. Obtener usuario actual
    const clienteManual = localStorage.getItem('cliente_manual');
    const authUser = auth.currentUser;
    
    let userId = null;
    let collectionName = "clientes";

    if (clienteManual) {
      const parsed = JSON.parse(clienteManual);
      userId = parsed.email || parsed.id;
      collectionName = "clientes";
    } else if (authUser) {
      userId = authUser.email;
      collectionName = "admins";
    }

    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito.',
        background: '#111111',
        color: '#ffffff',
        confirmButtonColor: '#E07820',
      });
      return;
    }

    // 2. Obtener el carrito actual (intentar de Firestore para estar sincronizados)
    let cart = await getCartFromFirestore(userId, collectionName);
    
    // Si falla Firestore o está vacío, intentar localStorage por si acaso
    if (cart.length === 0) {
        const cartKey = `carrito_${userId}`;
        const cartStr = localStorage.getItem(cartKey);
        if (cartStr) cart = JSON.parse(cartStr);
    }

    // 3. Revisar si el producto ya está en el carrito
    const existingIndex = cart.findIndex((item: any) => item.id === producto.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        ...producto,
        quantity: 1
      });
    }

    // 4. Guardar carrito en local y Firestore
    const cartKey = `carrito_${userId}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    await saveCartToFirestore(userId, collectionName, cart);

    // Opcional: Feedback extra si quieres, pero ProductCardCl ya lo hace
  };

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-pedal-bgMain">
        <div className="grow flex flex-col items-center justify-center pt-32">
          <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin mb-4" />
          <p className="text-white/60 animate-pulse font-syne">Preparando el catálogo...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-pedal-bgMain">
      <div className="grow">
        <ProductListCliente 
          productos={productos}
          categorias={categorias}
          onAddToCart={handleAddToCart}
        />
      </div>
      <Footer />
    </main>
  );
}