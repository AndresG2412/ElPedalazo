"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Container from "../components/Container";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            let isUserAdmin = false;
            const adminEmails = ["cgaviria930@gmail.com", "andres@elpedalazo.com"];
            
            if (adminEmails.includes(currentUser.email || "")) {
                isUserAdmin = true;
            }

            try {
                const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                if (adminDoc.exists()) isUserAdmin = true;
            } catch (error) {
                // Silencioso: Fallback a lista manual
            }

            setIsAdmin(isUserAdmin);
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

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-pedal-bgMain flex items-center justify-center p-6">
                <Container>
                    <div className="max-w-md mx-auto bg-pedal-bgSurface border border-red-500/20 p-10 rounded-[2.5rem] text-center animate-fade-up">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <ShieldAlert size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 font-syne">Acceso Restringido</h1>
                        <p className="text-white/50 mb-8">
                            No tienes permisos de administrador para acceder a esta sección. Si crees que esto es un error, contacta al soporte técnico.
                        </p>
                        <Link 
                            href="/" 
                            className="inline-block px-8 py-4 bg-pedal-primary-glow text-black font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return <>{children}</>;
}
