"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Lock, Package } from 'lucide-react';
import Container from '../components/Container';
import Link from 'next/link';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import { saveCartToFirestore, getCartFromFirestore } from '@/firebase/cart';

export default function Carrito() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        const loadCart = async (userId: string, colName: string) => {
            // Intentar cargar de Firestore primero para persistencia entre dispositivos
            const cloudCart = await getCartFromFirestore(userId, colName);
            
            if (cloudCart && cloudCart.length > 0) {
                setCartItems(cloudCart);
                // Sincronizar local
                localStorage.setItem(`carrito_${userId}`, JSON.stringify(cloudCart));
            } else {
                // Si no hay en nube, ver si hay en local
                const savedCart = localStorage.getItem(`carrito_${userId}`);
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                } else {
                    setCartItems([]);
                }
            }
        };

        const savedClient = localStorage.getItem("cliente_manual");
        let manualUser = null;
        if (savedClient) {
            manualUser = JSON.parse(savedClient);
            const mid = manualUser.email || manualUser.id;
            setUser({ ...manualUser, id: mid, collectionName: "clientes" });
            loadCart(mid, "clientes");
            setLoading(false);
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const uid = currentUser.email; // Usar email como ID para admins/usuarios
                setUser({ ...currentUser, id: uid, collectionName: "admins" });
                loadCart(uid!, "admins");
            } else if (!manualUser) {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const saveCart = async (newCart: any[]) => {
        if (!user) return;
        
        const userId = user.email || user.id || user.uid;
        const colName = user.collectionName || (user.uid ? "admins" : "clientes");
        
        // Guardar local para respuesta instantánea
        localStorage.setItem(`carrito_${userId}`, JSON.stringify(newCart));
        setCartItems(newCart);
        
        // Sincronizar con Firestore
        await saveCartToFirestore(userId, colName, newCart);
    };

    const updateQuantity = (id: string, delta: number) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                // Validación stock si item.stock existe
                const finalQuantity = item.stock ? Math.min(newQuantity, item.stock) : newQuantity;
                return { ...item, quantity: finalQuantity };
            }
            return item;
        });
        saveCart(newCart);
    };

    const removeItem = (id: string) => {
        const newCart = cartItems.filter(item => item.id !== id);
        saveCart(newCart);
    };

    const handleCheckout = () => {
        Swal.fire({
            icon: 'info',
            title: 'Continuar compra',
            text: 'La pasarela de pagos está en desarrollo. ¡Pronto podrás finalizar tus compras!',
            background: '#111111',
            color: '#ffffff',
            confirmButtonColor: '#E07820',
        });
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-pedal-bgMain flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pedal-primary-glow/20 border-t-pedal-primary-glow rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pedal-bgMain pt-0 md:pt-16 flex items-center md:block">
            <Container>
                {!user ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 bg-pedal-bgSurface border border-pedal-primary-glow/10 rounded-4xl text-center max-w-2xl mx-auto animate-fade-up mt-12">
                        <div className="w-20 h-20 bg-pedal-primary-glow/10 rounded-full flex items-center justify-center mb-6 border border-pedal-primary-glow/20">
                            <Lock size={32} className="text-pedal-primary-glow" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 font-syne">Inicia sesión para comprar</h2>
                        <p className="text-white/50 mb-8 max-w-md">
                            Debes iniciar sesión para poder agregar productos a tu carrito y completar tu pedido. ¡Tus bicicletas favoritas te esperan!
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <p className="text-pedal-primary-glow font-medium text-sm mb-2">
                                Utiliza el ícono de usuario en la barra de navegación para entrar.
                            </p>
                            <Link
                                href="/productos"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Volver a la tienda
                            </Link>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-pedal-bgSurface border border-white/5 rounded-4xl text-center animate-fade-up mt-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 font-syne">Tu carrito está vacío</h2>
                        <p className="text-white/50 mb-8">Parece que aún no has añadido nada a tu colección.</p>
                        <Link
                            href="/productos"
                            className="flex items-center gap-2 px-8 py-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            <ArrowLeft size={18} />
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 animate-fade-up mt-12">
                        {/* List */}
                        <div className="lg:col-span-2 flex flex-col gap-y-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-pedal-bgSurface border border-white/5 rounded-2xl mt-6 sm:mt-12 w-full max-w-full overflow-hidden">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-8 h-8 text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2">{item.title}</h3>
                                        <p className="text-pedal-primary-glow/80 text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1">{item.category}</p>
                                        <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-4 flex-wrap">
                                            <div className="flex items-center border border-white/10 rounded-lg bg-black/20">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 sm:p-2 hover:text-pedal-primary-glow transition-colors"><Minus size={16} /></button>
                                                <span className="px-2 sm:px-4 text-white font-medium text-sm sm:text-base">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 sm:p-2 hover:text-pedal-primary-glow transition-colors"><Plus size={16} /></button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors p-1.5 sm:p-2">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-auto pl-2">
                                        <p className="text-pedal-primary-glow font-bold text-lg sm:text-xl">${(item.price * item.quantity).toLocaleString()}</p>
                                        {item.quantity > 1 && (
                                            <p className="text-white/30 text-[10px] sm:text-xs mt-1">${item.price.toLocaleString()} c/u</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1 mt-12">
                            <div className="p-8 bg-pedal-bgSurface border border-pedal-primary-glow/20 rounded-[2rem] sticky top-32">
                                <h2 className="text-xl font-bold text-white mb-6">Resumen de Compra</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-white/60">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>Envío</span>
                                        <span className="text-green-500 font-medium">Gratis</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between">
                                        <span className="text-white font-bold text-lg">Total</span>
                                        <span className="text-pedal-primary-glow font-bold text-2xl">${subtotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={handleCheckout} className="w-full py-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                                    Finalizar Compra
                                </button>
                                <p className="text-center text-white/30 text-xs mt-6">
                                    Transacción segura protegida por cifrado SSL.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}