"use client";
import { useState, useEffect } from "react";
import { X, Mail, Lock, LogIn, LogOut, Settings } from "lucide-react";
import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    User
} from "firebase/auth";
import { auth, googleProvider, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Swal from "sweetalert2";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Verificar si es admin (puedes ajustar esto según tu lógica)
                const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                const adminByEmail = await getDoc(doc(db, "admins", currentUser.email || ""));
                
                // Lista de correos admin manual opcional
                const adminEmails = ["cgaviria930@gmail.com", "andres@elpedalazo.com"];
                
                if (adminDoc.exists() || adminByEmail.exists() || adminEmails.includes(currentUser.email || "")) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // En app/components/AuthModal.tsx
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            let isUserAdmin = false;
            
            // Lista de correos admin manual (Esto siempre funciona sin Firestore)
            const adminEmails = ["cgaviria930@gmail.com", "andres@elpedalazo.com"];
            if (adminEmails.includes(currentUser.email || "")) {
                isUserAdmin = true;
            }
            try {
                // Intentar verificar en Firestore solo si las reglas lo permiten
                const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                const adminByEmail = await getDoc(doc(db, "admins", currentUser.email || ""));
                
                if (adminDoc.exists() || adminByEmail.exists()) {
                    isUserAdmin = true;
                }
            } catch (error) {
                console.warn("Firestore permissions: Usando solo lista manual de admins.");
            }
            
            setIsAdmin(isUserAdmin);
        } else {
            setIsAdmin(false);
        }
    });
    return () => unsubscribe();
}, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: 'Has iniciado sesión correctamente.',
                    background: '#0a0a0a',
                    color: '#fff',
                    confirmButtonColor: '#fbbf24'
                });
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                Swal.fire({
                    icon: 'success',
                    title: 'Cuenta creada',
                    text: 'Te hemos registrado con éxito.',
                    background: '#0a0a0a',
                    color: '#fff',
                    confirmButtonColor: '#fbbf24'
                });
            }
            onClose();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                background: '#0a0a0a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            onClose();
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            onClose();
            Swal.fire({
                icon: 'info',
                title: 'Sesión cerrada',
                background: '#0a0a0a',
                color: '#fff',
                confirmButtonColor: '#fbbf24'
            });
        } catch (error: any) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-pedal-bgMain border border-pedal-primary-glow/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {user ? "Mi Cuenta" : (isLogin ? "Iniciar Sesión" : "Crear Cuenta")}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {user ? (
                        <div className="flex flex-col gap-6 text-center">
                            <div className="flex flex-col items-center gap-3">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-pedal-primary-glow/50" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-pedal-primary-glow/10 flex items-center justify-center border-2 border-pedal-primary-glow/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-github"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5.315 2.1c.791 -.113 1.9 .145 3.333 .966l.272 .161l.16 .1l.397 -.083a13.3 13.3 0 0 1 4.59 -.08l.456 .08l.396 .083l.161 -.1c1.385 -.84 2.487 -1.17 3.322 -1.148l.164 .008l.147 .017l.076 .014l.05 .011l.144 .047a1 1 0 0 1 .53 .514a5.2 5.2 0 0 1 .397 2.91l-.047 .267l-.046 .196l.123 .163c.574 .795 .93 1.728 1.03 2.707l.023 .295l.007 .272c0 3.855 -1.659 5.883 -4.644 6.68l-.245 .061l-.132 .029l.014 .161l.008 .157l.004 .365l-.002 .213l-.003 3.834a1 1 0 0 1 -.883 .993l-.117 .007h-6a1 1 0 0 1 -.993 -.883l-.007 -.117v-.734c-1.818 .26 -3.03 -.424 -4.11 -1.878l-.535 -.766c-.28 -.396 -.455 -.579 -.589 -.644l-.048 -.019a1 1 0 0 1 .564 -1.918c.642 .188 1.074 .568 1.57 1.239l.538 .769c.76 1.079 1.36 1.459 2.609 1.191l.001 -.678l-.018 -.168a5.03 5.03 0 0 1 -.021 -.824l.017 -.185l.019 -.12l-.108 -.024c-2.976 -.71 -4.703 -2.573 -4.875 -6.139l-.01 -.31l-.004 -.292a5.6 5.6 0 0 1 .908 -3.051l.152 -.222l.122 -.163l-.045 -.196a5.2 5.2 0 0 1 .145 -2.642l.1 -.282l.106 -.253a1 1 0 0 1 .529 -.514l.144 -.047l.154 -.03z" /></svg>
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-semibold text-lg">{user.displayName || "Usuario"}</p>
                                    <p className="text-white/50 text-sm">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {isAdmin && (
                                    <Link 
                                        href="/admin" 
                                        onClick={onClose}
                                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-[1.02] transition-transform"
                                    >
                                        <Settings size={20} />
                                        Panel Admin
                                    </Link>
                                )}
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <LogOut size={20} />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60 ml-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-pedal-primary-glow/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-white/60 ml-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                        <input 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-pedal-primary-glow/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-pedal-primary-glow text-black font-bold rounded-xl mt-2 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {loading ? "Cargando..." : (isLogin ? "Entrar" : "Registrarse")}
                                </button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-pedal-bgMain px-4 text-white/30">O continúa con</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleGoogleLogin}
                                className="w-full py-3 px-4 bg-white/5 text-white font-semibold rounded-xl flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-google"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945" /></svg>
                                Google
                            </button>

                            <p className="text-center mt-8 text-white/50 text-sm">
                                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} {" "}
                                <button 
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-pedal-primary-glow font-semibold hover:underline"
                                >
                                    {isLogin ? "Regístrate" : "Inicia Sesión"}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
