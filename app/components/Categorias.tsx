import Image from "next/image";
import Container from "./Container";
import { CATEGORIAS } from "@/app/Constants/data";

export default function Categorias() {
  return (
    <section className="py-32 md:py-24 md:py-24 bg-pedal-bgMain" id="categorias">
      <Container>
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-syne font-black text-white mb-2">
            CATEGORÍAS
          </h2>
          <p className="text-pedal-textMuted font-sans text-base md:text-xl">
            Encuentra el equipo perfecto para tu estilo de pedaleo
          </p>
        </div>

        {/* Mobile: scroll horizontal con cards compactas */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {CATEGORIAS.map((cat, idx) => (
              <div
                key={idx}
                className="group relative flex-none w-[200px] h-[240px] overflow-hidden rounded-2xl bg-[#111111] border border-white/5 cursor-pointer snap-start"
              >
                {/* Imagen de fondo */}
                <div className="absolute inset-0">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="200px"
                    priority={idx === 0}
                    className="object-cover opacity-25 transition-all duration-700 group-active:opacity-40"
                  />
                </div>

                {/* Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90 pointer-events-none" />

                {/* Icono */}
                <div className="absolute top-4 right-4">
                  <cat.icon
                    strokeWidth={1.5}
                    className="w-6 h-6 text-[#A8A29E]"
                  />
                </div>

                {/* Texto */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-base font-syne font-bold text-white mb-1 leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-sans text-[#C4BDB5] leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de scroll */}
          <div className="flex justify-center gap-1.5 mt-3">
            {CATEGORIAS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full bg-white/20 ${idx === 0 ? "w-4 bg-white/60" : "w-1.5"}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: bento grid original */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 auto-rows-[300px]">
          {CATEGORIAS.map((cat, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl bg-[#111111] border border-white/5 cursor-pointer ${cat.className}`}
            >
              <div className="absolute inset-0">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 1200px) 50vw, 33vw"
                  priority={idx === 0}
                  className="object-cover opacity-20 transition-all duration-700 ease-in-out group-hover:scale-[102%] group-hover:opacity-40"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-90 pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />

              <div className="absolute top-6 right-6">
                <cat.icon
                  strokeWidth={1.5}
                  className="w-8 h-8 text-[#A8A29E] transition-all duration-500 group-hover:text-pedal-primary-glow group-hover:scale-110"
                />
              </div>

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