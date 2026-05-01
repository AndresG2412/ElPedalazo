import Image from 'next/image';
import Link from 'next/link'; // Importado para mejor práctica en Next.js
import { CircleCheck, ArrowRight } from 'lucide-react';
import bgImage from '../images/scott-scale-pov-real.png';
import Container from './Container';

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] md:h-[120vh] overflow-hidden px-2 md:px-5" id='inicio'>
      {/* Imagen de fondo */}
      <Image
        src={bgImage}
        alt="bg"
        fill
        className="object-cover object-right animate-bg-zoom"
        priority
      />

      {/* Overlay: gradiente + viñeta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.70) 100%),
            radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)
          `,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex items-center h-screen md:pt-16">
        <Container>
          <div className="max-w-[800px]">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-0 py-1 mb-8 text-xs font-bold tracking-[0.25em] uppercase text-pedal-primary animate-fade-up-anim">
              <div className="w-6 h-[2px] bg-pedal-primary" />
              <CircleCheck size={14} className="mr-1" />
              SCOTT COLOMBIA
            </div>

            {/* Headline */}
            <div className="overflow-hidden">
              <h1 className="transform font-syne origin-left font-black tracking-wider text-[clamp(2.5rem,8vw,7.5rem)] leading-[0.9] uppercase mb-8 animate-fade-up-anim [animation-delay:200ms]">
                <span className="block text-white ">
                  DOMINA
                </span>

                <div className='md:block flex'>
                  <span
                    className="block md:ml-[8%] ml-[4%]"
                    style={{
                      background: 'linear-gradient(180deg, #f0f0f0 0%, #9a9a9a 45%, #d4d4d4 75%, #7a7a7a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      WebkitTextStroke: '1px rgba(255,255,255,0.25)',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                    }}
                  >
                    LA
                  </span>

                  <span
                    className="block ml-[4%] md:ml-[8%] relative w-fit px-8 py-2"
                    style={{
                      background: `
                      radial-gradient(
                        ellipse at center, 
                        rgba(255, 255, 255, 0.25) 0%, 
                        rgba(255, 255, 255, 0.1) 40%, 
                        transparent 80%
                      )
                    `,
                    }}
                  >
                    <span
                      className="relative z-10"
                      style={{
                        WebkitTextFillColor: 'transparent',
                        WebkitTextStroke: '2px rgba(255,255,255,0.85)',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                      }}
                    >
                      RUTA.
                    </span>

                    {/* La línea decorativa debajo */}
                    <span className="absolute md:bottom-4 bottom-2 -z-10 left-0 w-full md:h-[12px] h-[8px] bg-pedal-primary" />

                  </span>
                </div>
              </h1>
            </div>

            {/* Descripción */}
            <p className="tracking-wide font-sans text-[clamp(1.15rem,1.8vw,1.3rem)] text-white/90 leading-relaxed max-w-[600px] mb-12 font-light [text-shadow:0_4px_15px_rgba(0,0,0,0.8)] animate-fade-up-anim [animation-delay:400ms]">
              Ingeniería suiza para el{' '}
              <strong className="text-white font-bold [text-shadow:0_0_20px_rgba(255,255,255,0.6)]">
                máximo desempeño
              </strong>. Descubre bicicletas de{' '}
              <span className="text-pedal-primary-glow font-semibold">diseño vanguardista</span>{' '}
              construidas para cruzar cualquier límite.
            </p>

            {/* Acciones Corregidas */}
            <div className="flex flex-wrap items-center gap-8 animate-fade-up-anim [animation-delay:600ms]">
              <Link
                href="#productos"
                className="text-md md:text-sm group relative px-8 py-4 bg-pedal-accent-glow text-pedal-primary-text rounded-full hover:shadow-pedal-bodyGrad2 hover:shadow-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-pedal-primary-glow transition-all duration-300"
              >
                Explorar Colección
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#servicios"
                className="text-white hover:scale-105 active:scale-95 cursor-pointer transition-transform uppercase tracking-widest text-md md:text-sm font-semibold border-b border-white/20 hover:border-pedal-primary py-1"
              >
                Agenda tu taller
              </Link>
            </div>

            <div className='mt-16 md:mt-0 md:absolute md:right-12 md:top-72 flex md:flex-col gap-y-10 justify-between'>
              <div className="tracking-widest">
                <div className="w-6 h-[3px] bg-pedal-primary" />
                <span className='text-5xl font-black font-syne '>01</span>
                <p className='md:pt-0 pt-2 text-sm font-light'>GARANTÍA<br />OFICIAL</p>
              </div>
              <div className="tracking-widest">
                <div className="w-6 h-[3px] bg-pedal-primary" />
                <span className='text-5xl font-black font-syne '>02</span>
                <p className='md:pt-0 pt-2 text-sm font-light'>SOPORTE<br />EXPERTO</p>
              </div>
              <div className="tracking-widest">
                <div className="w-6 h-[3px] bg-pedal-primary" />
                <span className='text-5xl font-black font-syne '>03</span>
                <p className='md:pt-0 pt-2 text-sm font-light'>AJUSTE<br />PREMIUM</p>
              </div>
            </div>

          </div>
        </Container>
      </div>
    </section>
  );
}