import React from 'react';
import { Star } from 'lucide-react';
import { MARQUEE_PHRASES } from '../Constants/data';

export default function Carrousel() {
    return (
        <div className="relative w-full overflow-hidden bg-pedal-primary py-3 border-y border-pedal-primary-glow/20">
            {/* Contenedor del Marquee */}
            <div className="flex whitespace-nowrap animate-marquee-scroll">
                {/* Duplicamos el contenido para el loop infinito */}
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 px-4">
                        {MARQUEE_PHRASES.map((phrase, index) => (
                            <React.Fragment key={index}>
                                <span className="text-pedal-primary-text font-syne font-bold text-lg uppercase tracking-widest flex items-center gap-4">
                                    {phrase}
                                    <Star className="w-5 h-5 fill-pedal-primary-text stroke-none" />
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
            
            {/* Overlay de gradiente para suavizar bordes (opcional pero premium) */}
            <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-pedal-primary to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-pedal-primary to-transparent z-10" />
        </div>
    );
}