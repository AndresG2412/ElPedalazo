import Image from "next/image";
import Container from "./Container";
import { CATEGORIAS } from "@/app/Constants/data";

export default function Categorias() {
  return (
    <section className="py-24 bg-pedal-bgMain" id="categorias">
      <Container>
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-syne font-black text-white mb-2">CATEGORÍAS</h2>
          <p className="text-pedal-textMuted font-sans text-lg md:text-xl">
            Encuentra el equipo perfecto para tu estilo de pedaleo
          </p>
        </div>

        <div className="grid grid-cols-1 h-[500px] md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 auto-rows-[300px]">
          {CATEGORIAS.map((cat, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl bg-[#111111] border border-white/5 cursor-pointer ${cat.className}`}
            >
              {/* Fondo con imagen y opacidad */}
              <div className="absolute inset-0">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={idx === 0}
                  className="object-cover opacity-20 transition-all duration-700 ease-in-out group-hover:scale-[102%] group-hover:opacity-40"
                />
              </div>

              {/* Gradiente para asegurar legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-90 pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />

              {/* Icono (Superior Derecha) */}
              <div className="absolute top-6 right-6">
                <cat.icon
                  strokeWidth={1.5}
                  className="w-8 h-8 text-[#A8A29E] transition-all duration-500 group-hover:text-pedal-primary-glow group-hover:scale-110"
                />
              </div>

              {/* Texto (Inferior Izquierda) */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-syne font-bold text-white mb-2 transition-colors duration-500 group-hover:text-pedal-primary-glow">
                  {cat.title}
                </h3>
                <p className="text-sm font-sans text-[#C4BDB5] transition-colors duration-500 group-hover:text-white">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}