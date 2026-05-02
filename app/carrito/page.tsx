"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Lock } from 'lucide-react';
import Container from '../components/Container';
import Link from 'next/link';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Carrito() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Mock de items por ahora
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
                    /* Guest View */
                    <div className="flex flex-col items-center justify-center py-10 px-6 bg-pedal-bgSurface border border-pedal-primary-glow/10 rounded-[2rem] text-center max-w-2xl mx-auto animate-fade-up mt-12">
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
                                href="/" 
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Volver a la tienda
                            </Link>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* Empty Cart View */
                    <div className="flex flex-col items-center justify-center py-24 bg-pedal-bgSurface border border-white/5 rounded-[2rem] text-center animate-fade-up mt-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 font-syne">Tu carrito está vacío</h2>
                        <p className="text-white/50 mb-8">Parece que aún no has añadido nada a tu colección.</p>
                        <Link 
                            href="/" 
                            className="flex items-center gap-2 px-8 py-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            <ArrowLeft size={18} />
                            Volver a la tienda
                        </Link>
                    </div>

                ) : (
                    /* Cart Items View */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-up">
                        {/* List */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-6 p-6 bg-pedal-bgSurface border border-white/5 rounded-2xl">
                                    {/* Mock Image */}
                                    <div className="w-24 h-24 bg-white/5 rounded-xl flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h3 className="text-white font-bold text-lg">{item.name}</h3>
                                        <p className="text-white/40 text-sm">{item.category}</p>
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="flex items-center border border-white/10 rounded-lg">
                                                <button className="p-2 hover:text-pedal-primary-glow transition-colors"><Minus size={16} /></button>
                                                <span className="px-4 text-white font-medium">1</span>
                                                <button className="p-2 hover:text-pedal-primary-glow transition-colors"><Plus size={16} /></button>
                                            </div>
                                            <button className="text-red-500/50 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-pedal-primary-glow font-bold text-xl">$0.00</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="p-8 bg-pedal-bgSurface border border-pedal-primary-glow/20 rounded-[2rem] sticky top-32">
                                <h2 className="text-xl font-bold text-white mb-6">Resumen de Compra</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-white/60">
                                        <span>Subtotal</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>Envío</span>
                                        <span className="text-green-500 font-medium">Gratis</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between">
                                        <span className="text-white font-bold text-lg">Total</span>
                                        <span className="text-pedal-primary-glow font-bold text-2xl">$0.00</span>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
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