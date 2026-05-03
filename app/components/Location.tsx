"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Phone } from "lucide-react";

function useBusinessStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    function check() {
      const now = new Date();
      const col = new Date(
        now.toLocaleString("en-US", { timeZone: "America/Bogota" })
      );
      const day = col.getDay(); // 0 = Dom, 6 = Sáb
      const mins = col.getHours() * 60 + col.getMinutes();

      // Lun–Sáb: 8:00 AM (480) – 7:00 PM (1140)
      // Dom: 9:00 AM (540) – 1:00 PM (780)
      const open =
        day >= 1 && day <= 6
          ? mins >= 480 && mins < 1140
          : mins >= 540 && mins < 780;

      setIsOpen(open);
    }

    check();
    const interval = setInterval(check, 60_000); // re-check every minute
    return () => clearInterval(interval);
  }, []);

  return isOpen;
}

export default function Location() {
  const isOpen = useBusinessStatus();

  return (
    <section className="bg-[#1c1a17] bg-linear-to-l from-[#050505] to-[#1C1105] text-white py-28 px-6" id="contacto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-14">
        {/* ── Left: info ── */}
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl md:text-5xl font-syne font-black text-[#e5e5e5] leading-[0.85] uppercase tracking-wide mb-4">
                <span
                    className="block z-10"
                    style={{
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: '2px rgba(255,255,255,0.85)',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                    }}
                >VISÍTANOS</span>
                </h2>
          <p className="text-[#aaa] text-md tracking-wide leading-relaxed mb-9">
            Estamos ubicados en el corazón de Pitalito. Ven y conoce nuestra
            tienda principal con el mejor surtido.
          </p>

          {/* Dirección */}
          <div className="flex items-start gap-4 mb-5">
            <div className="bg-[#2a2520] border border-pedal-primary/40 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#e07c2a]" />
            </div>
            <div>
              <p className="font-bold text-md tracking-wide mb-1">Dirección</p>
              <p className="text-[#bbb] text-sm leading-relaxed">
                Cra 5 #9-53, Centro
                <br />
                Pitalito, Huila
              </p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-start  gap-4 mb-5">
            <div className="bg-[#2a2520] border border-pedal-primary/40 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-[#e07c2a]" />
            </div>
            <div>
              <p className="font-bold text-md tracking-wide mb-1">Horario de Atención</p>
              <p className="text-[#bbb] text-sm leading-relaxed">
                Lunes - Sábado: 8:00 AM - 7:00 PM
                <br />
                Domingos: 9:00 AM - 1:00 PM
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex items-start gap-4">
            <div className="bg-[#2a2520] border border-pedal-primary/40 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-[#e07c2a]" />
            </div>
            <div>
              <p className="font-bold text-md tracking-wide mb-1">Contacto</p>
              <p className="text-[#bbb] text-sm">+57 311 449 7589</p>
              <a
                href="https://wa.me/573114497589"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e07c2a] text-sm mt-1 inline-block hover:underline"
              >
                Enviar mensaje →
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: map + status badge ── */}
        <div className="flex-1 w-full relative rounded-xl overflow-hidden shadow-2xl">
          <iframe
            title="Ubicación de la tienda"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d996.27!2d-76.03574!3d1.85302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e257f7312345%3A0xabcdef!2sCra.+5+%239-53%2C+Pitalito%2C+Huila!5e0!3m2!1ses!2sco!4v1"
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Dynamic open/closed badge */}
          {isOpen !== null && (
            <div className="absolute bottom-3 right-3 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs font-semibold text-gray-800">
                {isOpen ? "Abierto Ahora" : "Cerrado"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}