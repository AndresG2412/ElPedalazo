"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import Container from './Container';
import Link from 'next/link';
import { NAV_LINKS } from '../Constants/data';

// Hook para scroll suave con offset del navbar fijo
function useSmoothScroll() {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // Solo actuar en links internos tipo "#seccion"
        if (!href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;

        const navbarHeight = 80; // ajusta si tu navbar mide diferente
        const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({ top, behavior: 'smooth' });
    };

    return handleNavClick;
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const handleNavClick = useSmoothScroll();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Wrapper: cierra el sidebar Y hace scroll suave
    const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        setIsOpen(false);
        handleNavClick(e, href);
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 py-4 transition-all duration-300">
            <Container>
                <nav className="w-full py-3 px-8 flex items-center justify-between border bg-pedal-bgMain
                    border-pedal-primary-glow/20 rounded-full">

                    <div className='font-bold text-2xl cursor-default'>El Pedalazo</div>

                    {/* Links — solo desktop */}
                    <div className='hidden md:flex text-sm gap-x-5 uppercase font-semibold tracking-wide'>
                        {NAV_LINKS.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                onClick={(e) => handleNavClick(e, href)}
                                className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    <div className='flex items-center gap-x-3'>
                        <div className='hidden md:flex items-center gap-x-3'>
                            <button className='hover:scale-110 transition-transform cursor-pointer'>
                                <Search />
                            </button>
                            <Link href="/carrito" className='flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'>
                                <ShoppingCart />
                            </Link>
                            <button className='hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'>
                                <User />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className='block md:hidden hover:scale-110 transition-transform cursor-pointer'
                            aria-label="Buscar"
                        >
                            <Search size={22} />
                        </button>
                        <button
                            className='md:hidden hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'
                            onClick={() => setIsOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </nav>
            </Container>

            <div
                className={`md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <div
                ref={sidebarRef}
                className={`md:hidden fixed inset-y-0 right-0 z-50 w-[75%] bg-pedal-bgMain border-l border-pedal-primary-glow/20
                    flex flex-col p-8 gap-8 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className='flex items-center justify-between border-b border-pedal-primary-glow/20 pb-4'>
                    <div className='font-bold text-2xl cursor-default'>El Pedalazo</div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className='hover:scale-110 transition-transform border border-white/30 rounded-full p-2'
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Links móvil — scroll suave + cierra sidebar */}
                <nav className='flex flex-col gap-y-5 uppercase font-semibold tracking-wide text-lg'>
                    {NAV_LINKS.map(({ label, href }) => (
                        <a
                            key={label}
                            href={href}
                            onClick={(e) => handleMobileNavClick(e, href)}
                            className='hover:text-pedal-primary-glow hover:translate-x-1 transition-all cursor-pointer'
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div className='mt-auto mb-8 flex items-center gap-x-4 border-t border-pedal-primary-glow/20 pt-6'>
                    <button
                        onClick={() => setIsOpen(false)}
                        className='flex w-3/4 items-center justify-center gap-x-2 hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'
                        aria-label="Mi cuenta"
                    >
                        <User size={20} />
                        <p>Iniciar Seccion</p>
                    </button>
                    <Link
                        href="/carrito"
                        onClick={() => setIsOpen(false)}
                        className='flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'
                        aria-label="Carrito"
                    >
                        <ShoppingCart size={20} />
                    </Link>
                </div>
            </div>
            </header>
        </>
    );
}